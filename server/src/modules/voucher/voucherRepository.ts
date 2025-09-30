import mongoose, { PaginateModel } from 'mongoose';
import VoucherEntity, { IVoucher } from './voucherEntity';

export interface VoucherDocument extends mongoose.Document, IVoucher {}
export type VoucherPaginateModel = PaginateModel<VoucherDocument>;

const VoucherRepository = mongoose.model<VoucherDocument, VoucherPaginateModel>(
  'Voucher',
  VoucherEntity
);

export default VoucherRepository;
