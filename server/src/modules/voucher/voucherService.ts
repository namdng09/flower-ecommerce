import VoucherRepository from '~/modules/voucher/voucherRepository';
import {
  IVoucher,
  discountType,
  discountStatus
} from '~/modules/voucher/voucherEntity';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

export const voucherService = {
  list: async () => {
    return VoucherRepository.find();
  },

  show: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError(400, 'Invalid voucher id');
    }

    const voucher = await VoucherRepository.findById(id);
    if (!voucher) {
      throw createHttpError(404, 'Voucher not found');
    }

    return voucher;
  },

  create: async (voucherData: Partial<IVoucher>) => {
    const {
      code,
      discountType: type,
      discountValue,
      startDate,
      endDate
    } = voucherData;

    if (!code || !type || discountValue == null || !startDate || !endDate) {
      throw createHttpError(400, 'Missing required fields');
    }

    if (discountValue <= 0) {
      throw createHttpError(400, 'Discount value must be > 0');
    }

    if (!Object.values(discountType).includes(type)) {
      throw createHttpError(400, 'Invalid discount type');
    }

    if (type === discountType.percentage && discountValue > 100) {
      throw createHttpError(
        400,
        'Discount value for percentage must be <= 100'
      );
    }

    if (startDate < new Date() || endDate < new Date()) {
      throw createHttpError(400, 'Start date cannot be before current date');
    }

    if (startDate > endDate) {
      throw createHttpError(400, 'Start date cannot be after end date');
    }

    if (
      voucherData.minOrderValue !== undefined &&
      voucherData.minOrderValue < 0
    ) {
      throw createHttpError(400, 'Minimum order value must be >= 0');
    }

    if (voucherData.usageLimit !== undefined && voucherData.usageLimit <= 0) {
      throw createHttpError(400, 'Usage limit must be > 0');
    }

    const exists = await VoucherRepository.findOne({ code });
    if (exists) {
      throw createHttpError(400, 'Voucher code already exists');
    }

    const voucher = await VoucherRepository.create({
      ...voucherData,
      usedCount: voucherData.usedCount ?? 0,
      status: voucherData.status ?? discountStatus.active
    });

    return voucher;
  },

  update: async (id: string, voucherData: Partial<IVoucher>) => {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError(400, 'Invalid voucher id');
    }

    const voucher = await VoucherRepository.findById(id);
    if (!voucher) {
      throw createHttpError(404, 'Voucher not found');
    }

    if (
      voucherData.discountValue !== undefined &&
      voucherData.discountValue <= 0
    ) {
      throw createHttpError(400, 'Discount value must be > 0');
    }

    if (
      voucherData.discountType &&
      !Object.values(discountType).includes(voucherData.discountType)
    ) {
      throw createHttpError(400, 'Invalid discount type');
    }

    if (
      voucherData.discountType === discountType.percentage &&
      voucherData.discountValue !== undefined &&
      voucherData.discountValue > 100
    ) {
      throw createHttpError(
        400,
        'Discount value for percentage must be <= 100'
      );
    }

    if (voucherData.startDate && voucherData.startDate < new Date()) {
      throw createHttpError(400, 'Start date cannot be before current date');
    }

    if (
      voucherData.startDate &&
      voucherData.endDate &&
      voucherData.startDate > voucherData.endDate
    ) {
      throw createHttpError(400, 'Start date cannot be after end date');
    }

    if (voucherData.endDate && voucherData.endDate < new Date()) {
      throw createHttpError(400, 'End date cannot be before current date');
    }

    if (
      voucherData.minOrderValue !== undefined &&
      voucherData.minOrderValue < 0
    ) {
      throw createHttpError(400, 'Minimum order value must be >= 0');
    }

    if (voucherData.usageLimit !== undefined && voucherData.usageLimit <= 0) {
      throw createHttpError(400, 'Usage limit must be > 0');
    }

    const updated = await VoucherRepository.findByIdAndUpdate(id, voucherData, {
      new: true
    });

    return updated;
  },

  remove: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError(400, 'Invalid voucher id');
    }

    const deleted = await VoucherRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw createHttpError(404, 'Voucher not found');
    }

    return deleted;
  }
};
