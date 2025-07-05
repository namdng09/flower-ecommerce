import AddressModel, { IAddress } from './addressModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { title } from 'process';
import UserModel from '../user/userModel';

export const addressService = {
    list: async () => {
        const addresses = await AddressModel.find();
        if (!addresses || addresses.length === 0) {
            throw createHttpError(404, 'No address found');
        }
        return addresses;
    },

    show: async (addressId: string) => {
        if (!Types.ObjectId.isValid(addressId)) {
            throw createHttpError(400, 'Invalid address id');
        }
        const address = await AddressModel.findById(addressId);
        if (!address) {
            throw createHttpError(404, 'Address not found');
        }
        return address;
    },

    create: async (addressData: IAddress) => {
        const { userId, fullName, phone, province, district, ward, street, location, addressType = 'home', isDefault = false } = addressData;

        if (!userId || !Types.ObjectId.isValid(userId)) {
            throw createHttpError(400, 'Invalid or missing userId');
        }

        const userExists = await UserModel.exists({ _id: userId });
        if (!userExists) {
            throw createHttpError(404, 'User not found');
        }

        if (!fullName || !phone || !province || !district || !ward || !street) {
            throw createHttpError(400, 'Missing required fields');
        }

        if (isDefault) {
            await AddressModel.updateMany(
                { userId, isDefault: true },
                { isDefault: false }
            );
        }

        const newAddress = await AddressModel.create({
            userId,
            fullName,
            phone,
            province,
            district,
            ward,
            street,
            location,
            addressType,
            isDefault
        });
        return newAddress;
    },

    update: async (addressId: string, addressData: IAddress) => {
        if (!Types.ObjectId.isValid(addressId)) {
            throw createHttpError(400, 'Invalid address id');
        }

        const { userId, fullName, phone, province, district, ward, street, location, addressType, isDefault } = addressData;

        const address = await AddressModel.findById(addressId);
        if (!address) {
            throw createHttpError(404, 'Address not found');
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            throw createHttpError(400, 'Invalid or missing userId');
        }

        const userExists = await UserModel.exists({ _id: userId });
        if (!userExists) {
            throw createHttpError(404, 'User does not exist');
        }

        if (userId !== undefined) address.userId = userId;
        if (fullName !== undefined) address.fullName = fullName;
        if (phone !== undefined) address.phone = phone;
        if (province !== undefined) address.province = province;
        if (district !== undefined) address.district = district;
        if (ward !== undefined) address.ward = ward;
        if (street !== undefined) address.street = street;
        if (location !== undefined) address.location = location;
        if (addressType !== undefined) address.addressType = addressType;
        if (isDefault !== undefined) address.isDefault = isDefault;

        const updatedAddress = await address.save();

        if (isDefault === true && address.userId) {
            await AddressModel.updateMany(
                { userId: address.userId, _id: { $ne: addressId }, isDefault: true },
                { isDefault: false }
            );
        }

        return updatedAddress;
    },

    delete: async (addressId: string) => {
        if (!Types.ObjectId.isValid(addressId)) {
            throw createHttpError(400, 'Invalid address id');
        }
        const deletedAddress = await AddressModel.findByIdAndDelete(addressId);
        if (!deletedAddress) {
            throw createHttpError(404, 'Address not found');
        }
        return deletedAddress;
    }
};
