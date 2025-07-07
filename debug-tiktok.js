import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,  // mostra o browser
    defaultViewport: null,
    args: ['--start-maximized'],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // ajuste se necessário
  });

  const page = await browser.newPage();

  const tag = 'musica';

  console.log('Acessando TikTok...');
  await page.goto(`https://www.tiktok.com/tag/${tag}`, { waitUntil: 'domcontentloaded' });

  console.log('Esperando a lista de vídeos aparecer (até 30s)...');
  await page.waitForSelector('a[href*="/video/"]', { timeout: 30000 });

  // Espera extra para estabilizar
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Coletando dados...');
  const videos = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('a[href*="/video/"]').forEach(el => {
      const href = el.href;
      const desc = el.innerText.trim();
      results.push({ href, desc });
    });
    return results;
  });

  console.log('Dados coletados:', videos);

  await page.screenshot({ path: 'tiktok-debug-final.png', fullPage: true });
  console.log('Screenshot salva como tiktok-debug-final.png');

  await browser.close();
})();
