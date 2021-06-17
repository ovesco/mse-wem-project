import { chromium } from 'playwright';
import crawlProductPage from '../amazonCrawler/crawlProductPage';

(async () => {

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.amazon.com/OraMD-Bass-Toothbrushes-6-Pack/dp/B08CS1N3MT/ref=sr_1_1?dchild=1&keywords=Ora+MD&qid=1620133438&sr=8-1");

  console.log(await crawlProductPage(page));

  return;

  // Check breadcrumb to retrieve exact seller name
  const storeId = page.url().split(/[?#]/)[0].split('/').pop();
  const breadcrumbTitle = await page.$('[itemtype="http://schema.org/BreadcrumbList"] h1');
  const companyName = await breadcrumbTitle.textContent();

  console.log(storeId, companyName);
  return;

  // Scroll down multiple times to force load all products
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  const aTags = await page.$$('a');
  const hrefs = await Promise.all(aTags.map(async (it) => it.getAttribute('href')));
  const mappedLinks = hrefs.filter(it => it && it.includes('/dp/'))
    .map(it => new URL(it, page.url()).href.split(/[?#]/)[0]) // Clean it
    .filter(it => it.split('/').length > 5); // Product URL have multiple parts

  const links = [...new Set(mappedLinks)];

  links.forEach(it => console.log(it, it.split('/').length));
  await page.close();
  await context.close();
  await browser.close();
})();