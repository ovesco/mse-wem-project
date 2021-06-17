import { Page } from "playwright";


export default async (page: Page) => {

  const storeId = page.url().split(/[?#]/)[0].split('/').pop();

  // Check breadcrumb to retrieve exact seller name
  const breadcrumbTitle = await page.$('[itemtype="http://schema.org/BreadcrumbList"] h1');
  const storeName = await breadcrumbTitle.textContent();

  // Scroll down multiple times to force load all products
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  const aTags = await page.$$('a');
  const hrefs = await Promise.all(aTags.map(async (it) => it.getAttribute('href')));
  const mappedLinks = hrefs.filter(it => it && it.includes('/dp/'))
    .map(it => new URL(it, page.url()).href.split(/[?#]/)[0]) // Clean it
    .filter(it => it.split('/').length > 5); // Product URL have multiple parts

  const links = [...new Set(mappedLinks)];

  return {
    storeId,
    storeName,
    links,
  }
};