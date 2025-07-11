import { IAddress } from './addressModel';
import addressRepository from './addressRepository';
import { userRepository } from '../user/userRepository';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

export const addressService = {
  listByUserId: async (userId: string) => {
    if (!userId || !Types.ObjectId.isValid(userId as string)) {
      throw createHttpError(400, 'Invalid user id');
    }

    const addresses = await addressRepository.findByUserId(userId);
    return addresses;
  },

  show: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError(400, 'Invalid address id');
    }
    const address = await addressRepository.findById(id);
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

    const userExists = await userRepository.findById(user.toString());
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

    const newAddress = await addressRepository.create({
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

    if (isDefault && newAddress._id) {
      await addressRepository.setDefaultAddress(
        user,
        newAddress._id.toString()
      );
    }

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

    const address = await addressRepository.findById(id);
    if (!address) {
      throw createHttpError(404, 'Address not found');
    }

    if (!user || !Types.ObjectId.isValid(user)) {
      throw createHttpError(400, 'Invalid or missing user Id');
    }

    const userExists = await userRepository.findById(user.toString());
    if (!userExists) {
      throw createHttpError(404, 'User does not exist');
    }

    const updateData: Partial<IAddress> = {};
    if (user !== undefined) updateData.user = user;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (province !== undefined) updateData.province = province;
    if (ward !== undefined) updateData.ward = ward;
    if (street !== undefined) updateData.street = street;
    if (location !== undefined) updateData.location = location;
    if (plusCode !== undefined) updateData.plusCode = plusCode;
    if (addressType !== undefined) updateData.addressType = addressType;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updatedAddress = await addressRepository.findByIdAndUpdate(
      id,
      updateData
    );

    if (isDefault === true && updatedAddress?.user) {
      await addressRepository.setDefaultAddress(updatedAddress.user, id);
    }

    return updatedAddress;
  },

  delete: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError(400, 'Invalid address id');
    }
    const deletedAddress = await addressRepository.findByIdAndDelete(id);
    if (!deletedAddress) {
      throw createHttpError(404, 'Address not found');
    }
    return deletedAddress;
  }
};
