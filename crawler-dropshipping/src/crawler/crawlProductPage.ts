import { Page } from 'playwright';
import currencies from './data/currencies.json';

type returnType = {
  main?: {
      price: number;
      currency: string;
  };
  otherProducts: {
      price: number;
      currency: string;
      img: string;
      link: string;
  }[];
};

/**
 * Crawls a given dropshipping website page searching for main displayed price if any
 * as well as other products that can be found (link to page, image and price)
 */
const crawlProductPrice =  async (page: Page, withOtherProducts: boolean = true): Promise<returnType> => {

  await page.waitForLoadState('networkidle');
  const res = await page.evaluate(([currencies, withOtherProducts]) => {

    const currencyNodes: { node: Node, currency: string, price: number, priceNode: Node }[] = [];

    const walkAround = <T>(node: Node, callback: (node: Node) => T | null, level: number = 7): T | null => {
      if (level === 0 || node === null) return null;
      const res = callback(node);
      if (res !== null) return res;
      
      for (let i = 0; i < node.childNodes.length; ++i) {
        const childRes = walkAround(node.childNodes[i], callback, level - 1);
        if (childRes !== null) return childRes;
      }

      const parentRes = walkAround(node.parentElement, callback, level - 1);
      if (parentRes !== null) return parentRes;

      return null;
    }

    // Attempts to find a price related to a currency
    const priceFinder = (n: Node, level: number = 8): [number, Node] | null => {
      return walkAround(n, (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {

          // Retrieve all numbers from current node content, if any
          const numbers = (node.textContent.match(/[+-]?\d+(\.|\,)?\d+/g) || []).map(it => it.replace("'", '')) /*.map((it) => parseFloat(it.replace(',', '.'))) */.map((it) => {
            // Numbers can be built like 5,000.32 or 2,232 or shit like that
            // First clean it
            const nbData = it.replace(',', '.').split('.');
            if (nbData.length === 0) return parseFloat(it);

            const cents = nbData[nbData.length - 1].length < 3 ? nbData.pop() : 0; // If last part of number has a length of 1 or 2 caracters, assume cents
            return parseFloat(`${nbData.join('')}.${cents}`);
          });
          if (numbers.length > 0) {
  
            // If price is stroke, meaning "ITS A LIMITED ACTION WOOHOO", dont take it into account
            let current = node;
            for (let i = 0; i < 4; ++i) {
              if (current === null) return null;
              // @ts-ignore
              if (current.nodeName.toLowerCase() === 'strike' || (current.style && current.style.textDecoration.split(' ').includes('line-through'))) {
                return null;
              }
              current = current.parentElement;
            }
  
            // If multiple numbers found in string, take biggest one.
            // We assume that smaller ones might be "2 elements for XXX", a pack
            return [Math.max.apply(null, numbers), node];
          }
        }
        return null;
      }, level);
    }

    // Traverse dom tree to retrieve nodes
    const traverseDown = (node: Node) => {
      // Dont parse irrelevant nodes
      if (['script', 'style', '#cdata-section', '#comment', 'iframe'].includes(node.nodeName.toLowerCase())) {
        return;
      };

      // Dont parse hidden or invisible nodes
      // @ts-ignore
      if (node.nodeName.toLowerCase() !== 'body' && (node.offsetParent === null || (node.style && node.style.display === 'none') || (node.style && parseInt(node.style.opacity, 10) === 0))) {
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.split(' ').map((word) => word.replace(/\d+/g, '').replace('.', '').replace(',', '').toLowerCase());
        const detected = Object.values(currencies).filter(data => text.includes(data.symbol) || text.includes(data.code.toLowerCase()));
  
        if (detected.length === 1) {
  
          // Node contains a currency, try to find a price
          const price = priceFinder(node);
          if (price) {
            currencyNodes.push({ node, currency: detected[0].code, price: price[0], priceNode: price[1] });
          }
        }  
      }

      node.childNodes.forEach((it) => traverseDown(it));
    };

    // Start walking document to find prices and stuff
    traverseDown(document.body);

    if (currencyNodes.length === 0) return {
      main: null,
      otherProducts: [],
    };

    // Now we have all HTML nodes which contain a price
    // Select the "biggest" one, which should be the one for the article we're looking for
    const mappedPriceNodes = currencyNodes.map((it) => {
      try {
        const currStyle = window.getComputedStyle(it.priceNode.parentElement);
        return {
          currency: it.currency,
          currencyNode: it.node,
          priceNode: it.priceNode,
          price: it.price,
          priceSize: parseFloat(currStyle.fontSize),
          priceWeight: parseFloat(currStyle.fontWeight),
        }
      } catch (e) {
        return null;
      }
    }).filter((it) => it !== null);

    // FInd node(s) which have the biggest price displayed
    const maxHeight = Math.max.apply(null, mappedPriceNodes.map((it) => it.priceSize));
    const bigPriceNodes = mappedPriceNodes.filter((it) => it.priceSize === maxHeight);

    // If multiple nodes have a price in big, we take the smallest one, we believe we're on a "multiple products page" and as such won't return a single prodct.
    const realPriceNode = bigPriceNodes.length > 1 ? null : bigPriceNodes.pop(); // bigPriceNodes.sort((a, b) => a.price > b.price ? -1 : 1).pop();

    const main = realPriceNode ? {
      price: realPriceNode.price,
      currency: realPriceNode.currency
    } : null;

    if (!withOtherProducts) {
      return {
        main,
        otherProducts: []
      };
    }

    // For each other price node, we assume it's for another product. As such we try
    // To find an eventual link close to where the product is as well as an image for the said product!

    const otherProducts = mappedPriceNodes.filter(it => it !== realPriceNode).map((it) => {

      const walkingLevel = 15;
      const link = walkAround(it.priceNode, (node: Element) => {
        if (node && node.nodeName.toLowerCase() === 'a') {
          const url = new URL(node.getAttribute('href'), window.location.href);
          if (!url.pathname || url.pathname === "") { // No pathname, means no url details, means no article
            return null;
          } else {
            return url.href;
          }
        }
        return null;
      }, walkingLevel);


      const img = walkAround(it.priceNode, (node: HTMLImageElement) => {
        // @ts-ignore
        if (node === null || node === "" || !node) return null;
        if (node && node.nodeName.toLowerCase() === 'img') {
          // Actually an image, check if a usable one
          // We verify that it's dimensions is at least 200x200, otherwise we beleive it to be a logo or stuff
          if (node.naturalHeight > 150 && node.naturalWidth > 150) {
            return node.getAttribute('src');
          }
        }

        // Might also be a div or stuff with a background image yo!
        else if (node instanceof Element && node.clientWidth > 100 && node.clientHeight > 100) {
          const bgImage = [node.style.background, node.style.backgroundImage].find((it) => it && it.includes('url('));
          if (bgImage) {

            // We found a bg image! Also check if its an actually correct image
            const res = bgImage.match(/url\(["']?([^"']*)["']?\)/)[1].replace(/('|")/g,'');
            return res;
          }
        }

        return null;
      }, walkingLevel);

      if (img === null || link === null) return null;
      else return {
        price: it.price,
        currency: it.currency,
        img: new URL(img, window.location.href).href, // Format URL for correct format
        link: new URL(link, window.location.href).href,
      }
    }).filter(it => it !== null);

    if (otherProducts.length === 0) return {
      main,
      otherProducts: [],
    };

    // We then filter out the less represented currencies, because we take for granted that this crawler
    // actually works somewhat, and that getting some weird currency would mean it found text like a currency, a number
    // too, picked a random image and a random linked and said "UuRr DuRr GoT aNoThEr PrOdUcT"
    const mappedCurrencies = otherProducts.map((it) => it.currency).reduce((acc, it) => {
      if (!acc[it]) acc[it] = 0;
      acc[it] += 1;
      return acc;
    }, {} as {[key: string]: number});

    const topCurrency = Object.entries(mappedCurrencies).reduce((acc, it) => acc[1] < it[1] ? it : acc, ["zob", -1]);
    const filteredProducts = otherProducts.filter((it) => it.currency === topCurrency[0]);

    return {
      main,
      otherProducts: filteredProducts,
    };
    
  }, [currencies, withOtherProducts]);

  return res;
};

export default crawlProductPrice;