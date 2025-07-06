import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  const tag = req.query.tag || 'musica';

  let browser;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.goto(`https://www.tiktok.com/tag/${tag}`, {
      waitUntil: 'networkidle2',
    });

    const data = await page.evaluate(() => {
      const videos = [];
      document.querySelectorAll('div[data-e2e="challenge-video-list-item"]').forEach(video => {
        const link = video.querySelector('a')?.href || '';
        const desc = video.querySelector('img')?.alt || '';
        videos.push({ link, desc });
      });
      return videos;
    });

    await browser.close();

    res.status(200).json({ status: 'ok', tag, videos: data });
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).json({ error: 'Erro ao buscar dados no TikTok', detalhe: err.message });
  }
}
