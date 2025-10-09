import { NextFunction, Request, Response } from 'express';
import { apiResponse } from '~/types/apiResponse';
import { voucherService } from '~/modules/voucher/voucherService';
import { IVoucher } from '~/modules/voucher/voucherEntity';

export const voucherController = {
  list: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const vouchers = await voucherService.list();

      return res
        .status(200)
        .json(apiResponse.success('Vouchers listed successfully', vouchers));
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const voucherData: IVoucher = req.body;

      const voucher = await voucherService.create(voucherData);

      return res
        .status(201)
        .json(apiResponse.success('Voucher created successfully', voucher));
    } catch (error) {
      next(error);
    }
  },

  show: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const voucher = await voucherService.show(id);
      return res
        .status(200)
        .json(apiResponse.success('Voucher detail', voucher));
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const voucherData: IVoucher = req.body;
      const updated = await voucherService.update(id, voucherData);
      return res
        .status(200)
        .json(apiResponse.success('Voucher updated successfully', updated));
    } catch (error) {
      next(error);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await voucherService.remove(id);
      return res
        .status(200)
        .json(apiResponse.success('Voucher deleted successfully', deleted));
    } catch (error) {
      next(error);
    }
  }
};
