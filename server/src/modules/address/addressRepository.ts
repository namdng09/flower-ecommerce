import AddressModel, { IAddress } from './addressModel';
import { FilterQuery, Types } from 'mongoose';

export const addressRepository = {
  findByUserId: async (userId: string | Types.ObjectId) => {
    return await AddressModel.find({ user: userId });
  },

  findById: async (addressId: string | Types.ObjectId) => {
    return await AddressModel.findById(addressId);
  },

  create: async (addressData: Partial<IAddress>) => {
    return await AddressModel.create(addressData);
  },

  findByIdAndUpdate: async (
    addressId: string | Types.ObjectId,
    updateData: Partial<IAddress>
  ) => {
    return await AddressModel.findByIdAndUpdate(addressId, updateData, {
      new: true
    });
  },

  findByIdAndDelete: async (addressId: string | Types.ObjectId) => {
    return await AddressModel.findByIdAndDelete(addressId);
  },

  countDocuments: async (filter: FilterQuery<IAddress> = {}) => {
    return await AddressModel.countDocuments(filter);
  },

  findByUserIdAndUpdate: async (
    userId: string | Types.ObjectId,
    updateData: Partial<IAddress>
  ) => {
    return await AddressModel.findOneAndUpdate({ user: userId }, updateData, {
      new: true
    });
  },

  findByUserIdAndDelete: async (userId: string | Types.ObjectId) => {
    return await AddressModel.findOneAndDelete({ user: userId });
  },

  findDefaultByUserId: async (userId: string | Types.ObjectId) => {
    return await AddressModel.findOne({ user: userId, isDefault: true });
  },

  findAllActive: async (filter: FilterQuery<IAddress> = {}) => {
    return await AddressModel.find({ ...filter, isActive: true });
  },

  setDefaultAddress: async (
    userId: string | Types.ObjectId,
    addressId: string | Types.ObjectId
  ) => {
    // First, unset all default addresses for the user
    await AddressModel.updateMany(
      { user: userId },
      { $set: { isDefault: false } }
    );

    // Then set the specified address as default
    return await AddressModel.findByIdAndUpdate(
      addressId,
      { $set: { isDefault: true } },
      { new: true }
    );
  }
};

export default addressRepository;
