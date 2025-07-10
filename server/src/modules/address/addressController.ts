import { Request, Response, NextFunction } from 'express';
import { addressService } from './addressService';
import { apiResponse } from '~/types/apiResponse';
import { IAddress } from './addressModel';

/**
 * addressController.ts
 *
 * @description :: Server-side logic for managing addresses.
 */
export const addressController = {
  /**
   * GET /addresses
   * addressController.list()
   */
  list: async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const addresses = await addressService.listByUserId(userId);

    return res
      .status(200)
      .json(apiResponse.success('Addresses listed successfully', addresses));
  },
  /**
   * GET /addresses/:id
   * addressController.show()
   */
  show: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const address = await addressService.show(id);

    return res
      .status(200)
      .json(apiResponse.success('Address fetched successfully', address));
  },
  /**
   * POST /addresses
   * addressController.create()
   */
  create: async (req: Request, res: Response): Promise<Response> => {
    const addressData: IAddress = req.body;

    const newAddress = await addressService.create(addressData);

    return res
      .status(201)
      .json(apiResponse.success('Address created successfully', newAddress));
  },
  /**
   * PUT /addresses/:id
   * addressController.update()
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    const { addressId } = req.params;
    const addressData: IAddress = req.body;

    const address = await addressService.update(addressId, addressData);

    return res
      .status(200)
      .json(apiResponse.success('Address updated successfully', address));
  },
  /**
   * DELETE /addresses/:id
   * addressController.delete()
   */
  delete: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { addressId } = req.params;

      const address = await addressService.delete(addressId);

      return res
        .status(200)
        .json(apiResponse.success('Address deleted successfully', address));
    } catch (error) {
      next(error);
    }
  }
};
