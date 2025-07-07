import fs from 'fs/promises';

const isProd = process.env.AWS_REGION || process.env.VERCEL;

let puppeteer, chromium;

if (isProd) {
  import('@sparticuz/chromium').then(mod => {
    chromium = mod.default;
  });
  import('puppeteer-core').then(mod => {
    puppeteer = mod.default;
  });
} else {
  import('puppeteer').then(mod => {
    puppeteer = mod.default;
  });
}

export default async function handler(req, res) {
  const tag = req.query.tag || 'musica';

  let browser;
  let page;

  try {
    if (!puppeteer) {
      if (isProd) {
        chromium = (await import('@sparticuz/chromium')).default;
        puppeteer = (await import('puppeteer-core')).default;
      } else {
        puppeteer = (await import('puppeteer')).default;
      }
    }

    if (isProd) {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      browser = await puppeteer.launch({
        headless: false, // falso para você ver a execução, mude para true no servidor
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    page = await browser.newPage();

    // Tentar carregar cookies
    try {
      const cookiesString = await fs.readFile('./cookies.json', 'utf-8');
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
      console.log('✅ Cookies carregados e aplicados.');
    } catch (err) {
      console.log('⚠️ Nenhum cookie encontrado ou inválido. Continuando sem cookies.');
    }

    console.log(`🌐 Acessando https://www.tiktok.com/tag/${tag} ...`);
    await page.goto(`https://www.tiktok.com/tag/${tag}`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('⏳ Esperando lista de vídeos aparecer...');
    await page.waitForSelector('div[data-e2e="challenge-video-list-item"], a[href*="/video/"]', { timeout: 30000 });

    console.log('⌛ Esperando a página estabilizar...');
    await new Promise(r => setTimeout(r, 5000)); // espera adicional

    const videos = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('div[data-e2e="challenge-video-list-item"], a[href*="/video/"]').forEach(el => {
        const a = el.querySelector('a[href*="/video/"]') || el;
        const img = el.querySelector('img');
        if (a && a.href.includes('/video/')) {
          items.push({
            href: a.href,
            desc: img?.alt || a.innerText.trim() || ''
          });
        }
      });
      return items;
    });

    console.log(`✅ Coletados ${videos.length} vídeos.`);

    await browser.close();

    res.status(200).json({ status: 'ok', tag, videos });
  } catch (err) {
    if (browser) await browser.close();
    console.error('🚨 Erro:', err.message);
    res.status(500).json({
      error: 'Erro ao buscar dados no TikTok',
      detalhe: err.message,
    });
  }
}
