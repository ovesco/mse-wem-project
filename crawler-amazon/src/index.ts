import mongoose from 'mongoose';
import Apify from 'apify';
import getCrawler, {
  cleanUrl,
  PRODUCT_PAGE
} from './crawler';

// Startng with a lotion stuff

const startingUrls = [
  'https://www.amazon.com/CeraVe-Hydrating-Facial-Cleanser-Fragrance/dp/B01MSSDEPK/ref=pd_rhf_gw_s_pd_crcd_0_6?_encoding=UTF8&ie=UTF8&pd_rd_i=B01MSSDEPK&pd_rd_r=4B846Q30H2C4HHM40FGT&pd_rd_w=bEH0y&pd_rd_wg=SAPC6&pf_rd_p=ecb2692f-0365-4eca-a102-58ef51a608ce&pf_rd_r=4B846Q30H2C4HHM40FGT&pf_rd_s=recent-history-footer&pf_rd_t=gateway&psc=1&refRID=4B846Q30H2C4HHM40FGT',
  'https://www.amazon.com/CeraVe-Facial-Moisturizing-Lotion-AM/dp/B00F97FHAW/ref=pd_rhf_gw_s_pd_crcd_0_7?_encoding=UTF8&ie=UTF8&pd_rd_i=B00F97FHAW&pd_rd_r=4B846Q30H2C4HHM40FGT&pd_rd_w=bEH0y&pd_rd_wg=SAPC6&pf_rd_p=ecb2692f-0365-4eca-a102-58ef51a608ce&pf_rd_r=4B846Q30H2C4HHM40FGT&pf_rd_s=recent-history-footer&pf_rd_t=gateway&psc=1&refRID=4B846Q30H2C4HHM40FGT',
  'https://www.amazon.com/Neutrogena-Oil-Free-Eye-Makeup-Remover/dp/B000NWAOHE/ref=pd_vtp_3/136-1440590-5363353?pd_rd_w=jSWoD&pf_rd_p=96226b5f-2d9a-439b-be45-97603787c682&pf_rd_r=X9HW1Q0DQY1EN5VCAWH2&pd_rd_r=a4c6a307-2352-4272-b505-e8e5c6741e84&pd_rd_wg=1Hnsx&pd_rd_i=B000NWAOHE&psc=1',
  'https://www.amazon.com/Neutrogena-Hydro-Boost-Hydrating-Cleanser/dp/B01LETURZI/ref=pd_vtp_7/136-1440590-5363353?pd_rd_w=jSWoD&pf_rd_p=96226b5f-2d9a-439b-be45-97603787c682&pf_rd_r=X9HW1Q0DQY1EN5VCAWH2&pd_rd_r=a4c6a307-2352-4272-b505-e8e5c6741e84&pd_rd_wg=1Hnsx&pd_rd_i=B01LETURZI&psc=1',
  'https://www.amazon.com/Dove-Body-Wash-Pump-Moisture/dp/B00MEDOY2G/ref=pd_vtp_14/136-1440590-5363353?pd_rd_w=jSWoD&pf_rd_p=96226b5f-2d9a-439b-be45-97603787c682&pf_rd_r=X9HW1Q0DQY1EN5VCAWH2&pd_rd_r=a4c6a307-2352-4272-b505-e8e5c6741e84&pd_rd_wg=1Hnsx&pd_rd_i=B00MEDOY2G&psc=1'
];

(async () => {

  // 54D36&9zfdr?abFm

  try {
    await mongoose.connect('mongodb+srv://wemUser:6HQvFsu2Tephg0e9@cluster0.fhlvt.mongodb.net/wemamazonmulti?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    Apify.main(async () => {

      const requestQueue = await Apify.openRequestQueue();

      for (const url of startingUrls) {
        const clean = cleanUrl(url);
        if (clean !== null) {
          await requestQueue.addRequest({
            url,
            uniqueKey: clean[1],
            userData: { requestType: PRODUCT_PAGE },
          });
        }
      }
  
      const crawler = getCrawler(requestQueue);
      await crawler.run();
    });
  } catch (e) {
    console.log('Error connecting to mongodb', e);
  }
})();