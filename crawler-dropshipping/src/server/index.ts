import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import atob from 'atob';
import btoa from 'btoa';

import Entry from '../mongo';

const app = express();

app.use(cors());

const port = 3000;

(async () => {

  try {
    await mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true, dbName: 'wem-crawl' });

    app.get("/products", async (req, res) => {

      const page = parseInt(req.query.page as string || "0", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);

      const count = await Entry.aggregate([
        { "$group": {
          "_id": {
            "productPicture": "$productPicture"
          },
          "count": { "$sum": 1 },
        }},
        { "$group": {
          "_id": {
            "productPicture": "$productPicture"
          },
          "totalCount": { "$sum": "$count" }
        }}
      ]);

      const products = await Entry.aggregate([
        { "$group": {
          "_id": {
            "productPicture": "$productPicture"
          },
          "count": { "$sum": 1 },
        }},
        { $sort: { "count": -1 } },
        { $skip: page * limit },
        { $limit: limit },
      ]);

      res.json({
        products: products.map(it => ({
          picture: it._id.productPicture,
          count: it.count,
          encoded: btoa(it._id.productPicture),
        })),
        totalCount: count[0].totalCount,
      });
    });

    app.get("/product", async (req, res) => {
      const productPicture = req.query.picture;
      if (!productPicture) res.json({ error: "No picture provided "});
      else {
        const pictureUrl = atob(productPicture as string);
        const sellers = await Entry.find({ productPicture: pictureUrl }).exec();

        res.json(sellers);
      }
    });

    app.listen(port, () => {
      console.log('Running');
    });

  } catch (e) {
    console.log('Error connecting to mongodb', e);
  }
})();