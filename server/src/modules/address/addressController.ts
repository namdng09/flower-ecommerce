import { Types } from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import AddressModel from './addressModel';
import { apiResponse } from '~/types/apiResponse';
import UserModel from '../user/userModel';
import createHttpError from 'http-errors';

/**
 * addressController.ts
 *
 * @description :: Server-side logic for managing addresses.
 */
export const addressController = {
  /**
   * GET /addresses?userId=?
   * addressController.list()
   */
  list: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { userId } = req.query;

      if (!userId || !Types.ObjectId.isValid(userId as string)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const addresses = await AddressModel.find({ user: userId });

      return res
        .status(200)
        .json(apiResponse.success('Addresses listed successfully', addresses));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /addresses/:id
   * addressController.show()
   */
  show: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid address id');
      }

      const address = await AddressModel.findById(id);

      if (!address) {
        throw createHttpError(404, 'Address not found');
      }

      return res
        .status(200)
        .json(apiResponse.success('Address fetched successfully', address));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /addresses
   * addressController.create()
   */
  create: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const {
        user,
        fullName,
        phone,
        province,
        ward,
        street,
        location,
        plusCode,
        addressType = 'home',
        isDefault = false
      } = req.body;

      if (!user || !Types.ObjectId.isValid(user)) {
        throw createHttpError(400, 'Invalid or missing user Id');
      }

      const userExists = await UserModel.exists({ _id: user });
      if (!userExists) {
        throw createHttpError(404, 'User not found');
      }

      if (!fullName || !phone || !province || !ward || !street || !plusCode) {
        throw createHttpError(400, 'Missing required fields');
      }

      const validAddressTypes = ['home', 'office', 'other'];
      if (!validAddressTypes.includes(addressType)) {
        throw createHttpError(
          400,
          `Invalid addressType. Must be one of: ${validAddressTypes.join(', ')}`
        );
      }

      if (isDefault) {
        await AddressModel.updateMany(
          { user, isDefault: true },
          { isDefault: false }
        );
      }

      const newAddress = await AddressModel.create({
        user,
        fullName,
        phone,
        province,
        ward,
        street,
        location,
        plusCode,
        addressType,
        isDefault
      });

      return res
        .status(201)
        .json(apiResponse.success('Address created successfully', newAddress));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /addresses/:id
   * addressController.update()
   */
  update: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const {
        user,
        fullName,
        phone,
        province,
        ward,
        street,
        location,
        plusCode,
        addressType,
        isDefault
      } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid address id');
      }

      const validAddressTypes = ['home', 'office', 'other'];
      if (
        addressType !== undefined &&
        !validAddressTypes.includes(addressType)
      ) {
        throw createHttpError(
          400,
          `Invalid addressType. Must be one of: ${validAddressTypes.join(', ')}`
        );
      }

      const address = await AddressModel.findById(id);
      if (!address) {
        throw createHttpError(404, 'Address not found');
      }

      if (!user || !Types.ObjectId.isValid(user)) {
        throw createHttpError(400, 'Invalid or missing user Id');
      }

      const userExists = await UserModel.exists({ _id: user });
      if (!userExists) {
        throw createHttpError(404, 'User does not exist');
      }

      if (user !== undefined) address.user = user;
      if (fullName !== undefined) address.fullName = fullName;
      if (phone !== undefined) address.phone = phone;
      if (province !== undefined) address.province = province;
      if (ward !== undefined) address.ward = ward;
      if (street !== undefined) address.street = street;
      if (location !== undefined) address.location = location;
      if (plusCode !== undefined) address.plusCode = plusCode;
      if (addressType !== undefined) address.addressType = addressType;
      if (isDefault !== undefined) address.isDefault = isDefault;

      const updatedAddress = await address.save();

      if (isDefault === true && address.user) {
        await AddressModel.updateMany(
          { user: address.user, _id: { $ne: id }, isDefault: true },
          { isDefault: false }
        );
      }

      return res
        .status(200)
        .json(
          apiResponse.success('Address updated successfully', updatedAddress)
        );
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /addresses/:id
   * addressController.remove()
   */
  remove: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid address id');
      }

      const deletedAddress = await AddressModel.findByIdAndDelete(id);

      if (!deletedAddress) {
        throw createHttpError(404, 'Address not found');
      }

      return res
        .status(200)
        .json(apiResponse.success('Address removed successfully'));
    } catch (error) {
      next(error);
    }
  }
};
