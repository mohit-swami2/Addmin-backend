import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from '../../shared/utils/constants.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: PRODUCT_STATUSES, default: 'Active' },
    description: { type: String, default: '' },
    image: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.methods.toListJSON = function toListJSON(req) {
  const base = process.env.OAUTH_CALLBACK_BASE_URL || '';
  const image = this.image
    ? this.image.startsWith('http')
      ? this.image
      : `${base}/uploads/${this.image.replace(/^\//, '')}`
    : null;
  return {
    id: this._id.toString(),
    name: this.name,
    sku: this.sku,
    category: this.category,
    price: this.price,
    stock: this.stock,
    status: this.status,
    description: this.description,
    image,
    createdAt: this.createdAt,
  };
};

const Product = mongoose.model('Product', productSchema);
export default Product;
