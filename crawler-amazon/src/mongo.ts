import mongoose from 'mongoose';
import { ProductData } from './crawler';

const productEntry = new mongoose.Schema({
  storeId: String,
  storeName: String,
  price: String,
  href: String,
  origin: String,
  protocol: String,
  host: String,
  pathname: String,
  productId: String,
  productTitle: String,
  productGlobalReview: String,
  numberOfRatings: String,
  categories: [String],
});

const reviewEntry = new mongoose.Schema({
  productId: String,
  storeId: String,
  author: String,
  authorImg: String,
  authorLink: String,
  stars: String,
  title: String,
  fromAndDate: String,
  content: String,
  foundHelpful: String,
});

const Product = mongoose.model('product', productEntry);
const Review = mongoose.model('review', reviewEntry);

const saveProductReviews = async (data: ProductData, productUrl: string) => {

  const reviews = data.reviews.map(it => ({
    productId: data.productId,
    storeId: data.storeId,
    ...it
  }));

  const url = new URL(productUrl);

  await Review.insertMany(reviews.map(it => new Review(it)));
  await Product.create(new Product({
    storeId: data.storeId,
    storeName: data.storeName,
    price: data.price,
    href: url.href,
    origin: url.origin,
    protocol: url.protocol,
    host: url.host,
    pathname: url.pathname,
    productId: data.productId,
    productTitle: data.productTitle,
    productGlobalReview: data.productGlobalReview,
    numberOfRatings: data.numberOfRatings,
    categories: data.categories,
  }));
};

const alreadyExist = async (url: string) => {
  const data = url.split('/');
  const indexOfDp = data.indexOf('dp');
  if (indexOfDp === -1) return true; // If no ID found, stop right here its not a product m8
  const productId = data[indexOfDp + 1];

  const doc = await Product.findOne({ productId }).exec();
  return doc !== null;
};

export {
  saveProductReviews,
  alreadyExist,
};