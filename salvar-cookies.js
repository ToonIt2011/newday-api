import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.tiktok.com', { waitUntil: 'networkidle2' });

  console.log('\n🔑 Faça login na conta do TikTok na janela que abriu.');
  console.log('⏳ Você tem 60 segundos para logar...');

  // substitui page.waitForTimeout por delay
  await delay(60000);

  console.log('💾 Salvando cookies...');
  const cookies = await page.cookies();

  await writeFile('cookies.json', JSON.stringify(cookies, null, 2));
  console.log('✅ Cookies salvos em cookies.json na raiz do projeto!');

  await browser.close();
})();
