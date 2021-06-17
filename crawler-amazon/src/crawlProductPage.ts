import Apify from 'apify';
import { ElementHandle, Page } from 'playwright';
import { Review, cleanUrl } from './crawler';

const upperLimit = 300; // Stop when we're reaching 100 reviews max

type Retriever = {
  selector: Promise<ElementHandle<HTMLElement | SVGElement>>,
  accessor?: (item: ElementHandle<HTMLElement>) => Promise<any>,
  modifier?: (str: string) => string
};

type Retrievers = {[key: string]: Retriever};

const cleanModifier = (str: string) => str.replace("\n", '').trim();
const starModifier = (str: string) => str.substr(0, 3);
const linkModifier = (str: string, base: string) => new URL(str, base).href.split(/[?#]/)[0];

const retrieveElements = async <T extends Retrievers>(items: T): Promise<{[key in keyof T]: string | null}> => {
  const mappedAsyncFields = Object.entries(items).map(async ([name, meta]) => {
    const node = await meta.selector;
    let value = null;

    if (node) {
      const content = meta.accessor
        ? await meta.accessor(node as ElementHandle<HTMLElement>)
        : await node.textContent();
      
      if (content !== null && content !== '') {
        value = meta.modifier ? meta.modifier(content) : content;
      }
    }

    return {
      name,
      value
    };
  });

  const awaited = await Promise.all(mappedAsyncFields);
  return awaited.reduce((acc, it) => {
    acc[it.name as keyof T] = it.value;
    return acc;
  }, {} as {[key in keyof T]: string}); 
}


export default async (page: Page) => {

  // Scroll down multiple times to force load everything
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  // retrieve product id
  const productId = (() => {
    const urlData = linkModifier(page.url(), page.url()).split('/');
    for (let i = 0; i < urlData.length; i++) {
      if (urlData[i] === 'dp') return urlData[i + 1];
    }
    return null;
  })();

  const pageMetadataElements = {
    storeLink: { selector: page.$('#bylineInfo'), accessor: (it: ElementHandle<HTMLElement>) => it.getAttribute('href'), modifier: (str: string) => linkModifier(str, page.url()) },
    storeId: { selector: page.$('#bylineInfo'), accessor: (it: ElementHandle<HTMLElement>) => it.getAttribute('href'), modifier: (str: string) => linkModifier(str, page.url()).split('/').pop() },
    productTitle: { selector: page.$('#productTitle'), modifier: cleanModifier },
    productGlobalReview: { selector: page.$('#acrPopover'), accessor: (it: ElementHandle<HTMLElement>) => it.getAttribute('title'), modifier: (str: string) => str.substr(0, 3) },
    numberOfRatings: { selector: page.$('#acrCustomerReviewText'), modifier: (str: string) => str.replace(',', "'").split(' ').shift() },
    price: { selector: page.$('#priceblock_ourprice') }
  };

  const pageMetadata = await retrieveElements(pageMetadataElements);

  // Get categories
  const categories: string[] = await (async () => {
    const breadcrumbDiv = await page.$$('#wayfinding-breadcrumbs_feature_div ul li');
    if (breadcrumbDiv.length > 0) {
      const cats = await Promise.all(breadcrumbDiv.map(it => it.textContent()));
      const cleanCats = cats.map(it => cleanModifier(it)).filter(it => it !== '›');
      return cleanCats;
    } else {
      return [];
    }
  })() || [];

  if (categories.length === 0) {
    throw new Error('No categories found');
  }

  // Get store name
  const storeName = await (async () => {

    const storeNameItem = await page.$('#bylineInfo');
    if (storeNameItem === null) return null;
    const tagName = (await storeNameItem.evaluate(e => e.tagName)).toLowerCase();
    if (tagName === 'div') {
      // Facing an author, dont care
      return null;
    } else {
      
      const textContent = await storeNameItem.textContent();
      
      // Name like Brand: ...
      if (textContent.toLowerCase().includes("brand")) {
        return textContent.split(' ').pop();
      }

      // Name in link "Visit the blablabla store"
      const parts = textContent.split(' ');
      const name = parts.slice(2, parts.length - 1);
      return name.join(' ');
    }
  })();

  if (storeName === null) {
    throw new Error('Couldnt read store name');
  }

  // Get related products
  const potentialCarouselLinks = [
    page.$("#anonCarousel2"), // From this brand
    page.$("#anonCarousel1"), // Other customers looked at
    page.$("#anonCarousel3"), // Inspired by your browsing history
    page.$("#anonCarousel4"), // More items to consider
  ];

  let relatedProductLinks = [];
  for await (const carousel of potentialCarouselLinks) {
    if (carousel) {
      const relatedLinks = await Promise.all((await carousel.$$('a')).map(async (it) => it.getAttribute('href')));
      relatedProductLinks = [...relatedProductLinks, ...relatedLinks.map(l => new URL(l, page.url()).href)];
    }
  }

  const mappedProductLinks: [string, string][] = relatedProductLinks.filter(it => it.split('/').includes('dp')).map(it => cleanUrl(it)).filter(it => it !== null);
  const filteredRelatedProductLinks: [string, string][]  = [];
  for (const [actualUrl, cleanUrl] of mappedProductLinks) {
    if (!filteredRelatedProductLinks.map(([, clean]) => clean).includes(cleanUrl)) {
      filteredRelatedProductLinks.push([actualUrl, cleanUrl]);
    }
  }


  // Go to custommer review page
  // But already filter by 5 stars to only get top reviews
  const reviewPage = page.url().replace('dp', 'product-reviews');
  const reviewUrl = `${new URL(reviewPage, page.url()).href}?pageNumber=1`;

  await page.goto(reviewUrl);

  let reviews: Review[] = [];

  while (reviews.length < upperLimit) {
    Apify.utils.log.info("Parsing next page of comments for page" + page.url() + ", currently got: " + reviews.length);
    // Reviews of page
    const reviewElements = await page.$$('[data-hook="review"]');
    const mappedReviewRetrievers = reviewElements.map(async (elem) => {

      // get review
      const reviewSelector = {
        author: { selector: elem.$('.a-profile-name') },
        authorImg: { selector: elem.$('.a-profile-avatar img'), accessor: (item: ElementHandle<HTMLElement>) => item.getAttribute('src'), modifier: (str: string) => linkModifier(str, page.url()) },
        authorLink: { selector: elem.$('a.a-profile'), accessor: (item: ElementHandle<HTMLElement>) => item.getAttribute('href'), modifier: (str: string) => linkModifier(str, page.url()) },
        stars: { selector: elem.$('[data-hook="review-star-rating"]'), modifier: starModifier },
        title: { selector: elem.$('[data-hook="review-title"]'), modifier: cleanModifier },
        fromAndDate: { selector: elem.$('[data-hook="review-date"]'), modifier: cleanModifier },
        content: { selector: elem.$('[data-hook="review-body"]'), modifier: cleanModifier },
        foundHelpful: { selector: elem.$('[data-hook="helpful-vote-statement"]'), modifier: (str: string) => cleanModifier(str).replace(/\D/g, '') },
      };

      return await retrieveElements(reviewSelector);
    });

    const pageReviews = await Promise.all(mappedReviewRetrievers);
    reviews = [...reviews, ...pageReviews];

    const nextButton = await page.$('[data-hook="pagination-bar"] .a-last a');
    if (!nextButton) break;

    // Add a small delay to look like we actually clicked
    else {
      await nextButton.click({ delay: Math.round(Math.random() * 50) });
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  if (reviews.length === 0) {
    throw new Error("Unable to parse reviews");
  }

  // Return all page data
  return {
    productId,
    storeName,
    ...pageMetadata,
    relatedProductLinks: filteredRelatedProductLinks,
    reviews,
    categories,
  };
};
