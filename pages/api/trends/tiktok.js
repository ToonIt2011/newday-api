import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  const { tag = "musica" } = req.query;

  if (!tag) {
    return res.status(400).json({ error: "Tag obrigatória" });
  }

  const url = `https://www.tiktok.com/tag/${encodeURIComponent(tag)}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    await page.waitForSelector("div[data-e2e='search_video_item']", { timeout: 15000 });

    const videos = await page.$$eval("div[data-e2e='search_video_item']", (nodes) =>
      nodes.slice(0, 10).map((node) => {
        const username =
          node.querySelector("a[data-e2e='video-user-name']")?.textContent?.trim() || "";
        const profileLink =
          node.querySelector("a[data-e2e='video-user-name']")?.href || "";
        const videoLink = node.querySelector("a")?.href || "";
        const likes =
          node.querySelector("strong[data-e2e='like-count']")?.textContent?.trim() || "0";

        return {
          username,
          profileLink,
          videoLink,
          likes,
        };
      })
    );

    const hashtags = await page.$$eval("a[href*='/tag/']", (nodes) =>
      [...new Set(nodes.map((n) => n.textContent.replace("#", "").trim()))]
    );

    res.status(200).json({
      status: "ok",
      tag,
      resultados: videos,
      hashtagsRelacionadas: hashtags,
    });
  } catch (err) {
    console.error("Erro no scraping do TikTok:", err);
    res.status(500).json({ error: "Erro ao buscar dados no TikTok", detalhe: err.message });
  } finally {
    if (browser) await browser.close();
  }
}
