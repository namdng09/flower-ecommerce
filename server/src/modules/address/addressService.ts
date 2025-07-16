import AddressModel, { IAddress } from './addressModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import UserRepository from '../user/userRepository';

export const addressService = {
  listByUserId: async (userId: string) => {
    if (!userId || !Types.ObjectId.isValid(userId as string)) {
      throw createHttpError(400, 'Invalid user id');
    }

    const addresses = await AddressModel.find({ user: userId });
    return addresses;
  },

  show: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError(400, 'Invalid address id');
    }
    const address = await AddressModel.findById(id);
    if (!address) {
      throw createHttpError(404, 'Address not found');
    }
    return address;
  },

  create: async (addressData: IAddress) => {
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
    } = addressData;

    if (!user || !Types.ObjectId.isValid(user)) {
      throw createHttpError(400, 'Invalid or missing user Id');
    }

    const userExists = await UserRepository.exists({ _id: user });
    if (!userExists) {
      throw createHttpError(404, 'User not found');
    }

    if (!fullName || !phone || !province || !ward || !street) {
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

    return newAddress;
  },

  update: async (id: string, addressData: IAddress) => {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError(400, 'Invalid address id');
    }

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
    } = addressData;

    if (!fullName || !phone || !province || !ward || !street) {
      throw createHttpError(400, 'Missing required fields');
    }

    const validAddressTypes = ['home', 'office', 'other'];
    if (addressType !== undefined && !validAddressTypes.includes(addressType)) {
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

    const userExists = await UserRepository.exists({ _id: user });
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

    return updatedAddress;
  },

  delete: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError(400, 'Invalid address id');
    }
    const deletedAddress = await AddressModel.findByIdAndDelete(id);
    if (!deletedAddress) {
      throw createHttpError(404, 'Address not found');
    }
    return deletedAddress;
  }
};
