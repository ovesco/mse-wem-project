import { Page } from 'playwright';

type returnType = string[];

/**
 * Crawls the given page (which points to images.google.com) to retrieve related products to the given
 * image
 */
const crawlGoogleReversedImageSearch =  async (page: Page, image: string, maxNumPages: number = 8): Promise<returnType> => {

  // Accept google images conditions
  const acceptConditionsBtn = await page.$$('#zV9nZe');
  if (acceptConditionsBtn.length > 0) {
    await page.click('#zV9nZe');
  }

  // Click search by picture button
  await page.click('.LM8x9c');

  // Load picture file
  await page.fill('#Ycyxxc', image);
  await page.click('#RZJ9Ub');

  // Check if not recaptcha form
  const captchaForm = await page.$('#captcha-form');
  const captchaDiv = await page.$('#recaptcha');

  if (captchaForm && captchaDiv && (await captchaDiv.getAttribute('data-callback')) === 'submitCallback') {
    return []; // We cant currently validate captcha, because this is out of scope of a WEM project (:
  }

  // Wait for finishing search
  await page.waitForNavigation();

  // Accept google conditions
  const acceptFrameHandle = await page.$('#cnsw iframe');
  if (acceptFrameHandle) {
    const acceptFrame = await acceptFrameHandle.contentFrame();
    await acceptFrame.click('#introAgreeButton');
  }

  // Retrieve current content
  let resultHref = [];

  for (let i = 0; i < maxNumPages; i++) {

    const resultTitle = await page.$$('.LC20lb.DKV0Md');
    const resultElements = await Promise.all(resultTitle.map((it) => it.$('xpath=..')));
    resultHref = [...resultHref, ...await Promise.all(resultElements.map(it => it.getAttribute('href')))];

    // Go to next page to get more links
    const elem = await page.$('#pnnext');
    if (!elem) break;

    await page.click('#pnnext');
    await page.waitForNavigation();
  }

  const filteredLinks = resultHref.map((it) => new URL(it)).reduce((acc, it) => {
    if (!(it.hostname in acc)) {
      acc[it.hostname] = it.href;
    }
    return acc;
  }, {} as {[key: string]: string});

  return Object.values(filteredLinks);
};

export default crawlGoogleReversedImageSearch;