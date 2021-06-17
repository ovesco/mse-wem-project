import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  productPicture: String,
  price: Number,
  currency: String,
  href: String,
  origin: String,
  protocol: String,
  host: String,
  pathname: String,
});

export default mongoose.model('product-entry', entrySchema);