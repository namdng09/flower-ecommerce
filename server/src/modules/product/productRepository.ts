import mongoose, { PaginateModel } from 'mongoose';
import ProductEntity, { IProduct } from './productEntity';

export interface ProductDocument extends mongoose.Document, IProduct {}
export type ProductPaginateModel = PaginateModel<ProductDocument>;

const ProductRepository = mongoose.model<ProductDocument, ProductPaginateModel>(
  'Product',
  ProductEntity
);

export default ProductRepository;
