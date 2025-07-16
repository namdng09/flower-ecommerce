import mongoose, { Model } from 'mongoose';
import VariantEntity, { IVariant } from './variantEntity';
const VariantRepository: Model<IVariant> = mongoose.model(
  'Variant',
  VariantEntity
);
export default VariantRepository;
