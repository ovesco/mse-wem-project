import Apify, { RequestQueue } from 'apify';
import crawlProductPage from './crawlProductPage';
import crawlSellerPage from './crawlSellerPage';
import { alreadyExist, saveProductReviews } from './mongo';

export const cleanUrl = (it: string) => {
  const data = it.split('/');
  let url = '';
  for (let i = 0; i < data.length; i++) {
    const part = data[i];
    if (part === 'dp' && i <= data.length - 2) {
      url += 'dp/' + data[i+1];
      return [it, url] as [string, string];
    } else {
      url += part + '/';
    }
  }
  return null;
};

export const PRODUCT_PAGE = 1;
export const SHOP_PAGE = 2;

export type Review = {
  author: string;
  authorImg: string;
  authorLink: string;
  stars: string;
  title: string;
  fromAndDate: string;
  content: string;
  foundHelpful: string;
};

export type ProductData = {
  relatedProductLinks: any[];
  reviews: Review[];
  storeLink: string;
  storeId: string;
  productTitle: string;
  productGlobalReview: string;
  numberOfRatings: string;
  price: string;
  productId: string;
  storeName: string;
  categories: string[];
};

export default (requestQueue: RequestQueue) => new Apify.PlaywrightCrawler({
  requestQueue,
  launchContext: {
    launchOptions: {
      headless: false,
    }
  },
  handlePageTimeoutSecs: 300, // Increase handling page to load more comments
  handlePageFunction: async ({ request, page }) => {

    Apify.utils.log.info('Current queue size: ' + (await requestQueue.getInfo()).pendingRequestCount);

    const { requestType } = request.userData;

    if (requestType === PRODUCT_PAGE) {

      // Check if product already in mongodb, if so cancel it
      if (await alreadyExist(page.url())) {
        Apify.utils.log.info("Page already crawled and in DB: " + page.url());
        return;
      }
      
      Apify.utils.log.info('Crawling product page: ' + request.url);

      try {
        const productData = await crawlProductPage(page);

        // Save stuff in mongodb
        try {
          await saveProductReviews(productData, request.url);
        } catch (e) {
          Apify.utils.log.error('Error while saving in mongo');
          console.log(e);
        }

        const { relatedProductLinks, storeLink, } = productData;
        // Crawl store if not crawled yet
        await requestQueue.addRequest({
          url: storeLink,
          userData: { requestType: SHOP_PAGE },
        });

        // Crawl related products
        for (const [actual, clean] of relatedProductLinks) {
          await requestQueue.addRequest({
            url: actual,
            uniqueKey: clean,
            userData: { requestType: PRODUCT_PAGE },
          });
        }

      } catch (e) {
        Apify.utils.log.warning('Crawling product page error: ' + e.message);
        console.log(e);
      }

    } else if (requestType === SHOP_PAGE) {
      Apify.utils.log.info('Crawling seller page: ' + request.url);

      try {

        const {
          storeId,
          storeName,
          links,
        } = await crawlSellerPage(page);

        // Add links to requestQueue
        for (const link of links) {
          await requestQueue.addRequest({
            url: link,
            userData: { requestType: PRODUCT_PAGE },
          });
        }

      } catch (e) {
        Apify.utils.log.warning('Crawling seller page error');
        console.log(e);
      }
    }
  },
});