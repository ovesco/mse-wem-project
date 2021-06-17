import Apify, { RequestQueue } from 'apify';
import crawlProductPage from './crawlProductPage';
import googleReversedSearch from './crawlGoogleImage';
import Entry from '../mongo';

export const GOOGLE_REVERSED_SEARCH = 1;
export const PRODUCT_CRAWL = 2;
export const GOOGLE_IMAGE_SEARCH_URL = "https://images.google.com";

export const buildUserData = (requestType: number, productPicture: string, withOtherProducts: boolean) => ({
  requestType, // Request type, google image search or product page crawling
  productPicture, // Current product picture
  withOtherProducts, // Also retrieve other products on product page
});


export default (requestQueue: RequestQueue) => new Apify.PlaywrightCrawler({
  requestQueue,
  launchContext: {
    launchOptions: {
      headless: true,
    }
  },
  handlePageFunction: async ({ request, page }) => {

    Apify.utils.log.info('Current queue size: ' + (await requestQueue.getInfo()).pendingRequestCount);
    // Request can be of two types:
    // - Either its a google image reversed request, where we wish to retrieve various website selling the product: { productPicture }
    // - Or its a request to parse one of those websites and retrieve info about the product

    const { requestType, productPicture } = request.userData;

    // Perform a google search
    if (requestType === GOOGLE_REVERSED_SEARCH) {

      Apify.utils.log.info('Google search: ' + productPicture);
      try {
        const resultLinks = await googleReversedSearch(page, productPicture);
        if (resultLinks.length === 0) { // Couldnt retrieve a single link, impossible for google, means we're blocked
          Apify.utils.log.error("Impossible to crawl google images");
          return; // Will eventually stop crawling product pages once done
        }

        // We filter resulting links to only get one link per webiste
        const filteredLinks = resultLinks.reduce((acc, link) => {
          const url = new URL(link);
          const host = url.host === "" || !url.host ? url.hostname : url.host;
          if (!acc.find(it => it.host === host)) {
            acc.push({ host, url: link });
          }
          return acc;
        }, [] as { host: string, url: string}[]);

        // For each result link, push a request to parse product page
        for (const link of filteredLinks) {
          await requestQueue.addRequest({
            url: link.url,
            userData: buildUserData(PRODUCT_CRAWL, productPicture, true),
          });
        }

      } catch (e) {
        Apify.utils.log.warning("Google search error", e);
      }
    }

    // Parse a product website page
    else if (requestType === PRODUCT_CRAWL) {
      const { withOtherProducts } = request.userData;

      Apify.utils.log.info('Page crawl' + (withOtherProducts === true ? ': ' : ' (no other): ') + page.url());

      try {
        const { main, otherProducts } = await crawlProductPage(page, withOtherProducts === true);

        // Might happen if we just parsed a category page, sometimes google sends us to it, without main product
        // But at least we can retrieve related products :)
        if (main) {
          // Save this motherfucker to the db
          const { href, origin, protocol, host, hostname, pathname } = new URL(page.url());

          const entry = {
            productPicture,
            href,
            origin,
            protocol,
            host,
            hostname,
            pathname,
            ...main,
          };

          const mongoEntry = new Entry(entry);
          await mongoEntry.save();
        }

        // With the other found products, parse them but dont try to find OTHER related products
        // We stick on google search to give us more links, we prefer more websites of same product rather
        // Than multiple products with only 1 selling point
        for (const it of otherProducts) {

          // Add a request to perform reversed google image search
          await requestQueue.addRequest({
            url: GOOGLE_IMAGE_SEARCH_URL,
            uniqueKey: page.url() + it.img, // Need to generate a specific unique key
            userData: buildUserData(GOOGLE_REVERSED_SEARCH, it.img, true),
          });

          // Add a request to parse related product page but without retrieving other products
          await requestQueue.addRequest({
            url: it.link,
            userData: buildUserData(PRODUCT_CRAWL, it.img, false),
          });
        }

      } catch (e) {
        Apify.utils.log.warning("Product crawl error", {
          url: page.url(),
          productPicture,
          e,
        });
      }
    }
  },
});