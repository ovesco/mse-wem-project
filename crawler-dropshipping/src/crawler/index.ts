import mongoose from 'mongoose';
import Apify from 'apify';
import getCrawler, {
  buildUserData,
  GOOGLE_REVERSED_SEARCH,
  GOOGLE_IMAGE_SEARCH_URL
} from './crawler';

const startingPicture = 'https://jaloux.ch/wp-content/uploads/2020/11/Souris-sans-fil-pour-ordinateur-souris-Rechargeable-ergonomique-silencieuse-avec-r-tro-clairage-optique-LED-USB-1.jpg_Q90-1.jpg__resultat_1-1.jpg';

(async () => {

  try {
    await mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true, dbName: 'wem-crawl' });
    Apify.main(async () => {

      const requestQueue = await Apify.openRequestQueue();
      await requestQueue.addRequest({
        url: GOOGLE_IMAGE_SEARCH_URL,
        userData: buildUserData(GOOGLE_REVERSED_SEARCH, startingPicture, true)
       });
  
      const crawler = getCrawler(requestQueue);
      await crawler.run();
    });
  } catch (e) {
    console.log('Error connecting to mongodb', e);
  }
})();