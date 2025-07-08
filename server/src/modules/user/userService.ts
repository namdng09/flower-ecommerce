import UserModel, { IUser } from './userModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { comparePassword } from '~/utils/bcrypt';
import { sendMail } from '~/utils/mailer';

export const userService = {
  list: async (role?: string) => {
    const validRoles = ['admin', 'customer', 'shop'];

    if (role && !validRoles.includes(role)) {
      throw createHttpError(400, 'Invalid role value');
    }

    const filter = role ? { role } : {};
    const users = await UserModel.find(filter).select('-password');

    return users;
  },

  filterUsers: async (
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    fullName?: string,
    username?: string,
    email?: string,
    role?: string,
    phoneNumber?: string
  ) => {
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'username',
      'email',
      'phoneNumber',
      'fullName'
    ];

    const sortField = allowedSortFields.includes(sortBy || '')
      ? sortBy
      : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const makeRegex = (value?: string | string[]) =>
      value ? { $regex: value, $options: 'i' } : undefined;

    const matchStage: Record<string, any> = {
      ...(fullName && { fullName: makeRegex(fullName) }),
      ...(username && { username: makeRegex(username) }),
      ...(email && { email: makeRegex(email) }),
      ...(role && { role }),
      ...(phoneNumber && { phoneNumber: makeRegex(phoneNumber) })
    };

    const aggregate = UserModel.aggregate([
      { $match: matchStage },
      { $sort: { [sortField as string]: sortDirection } }
    ]);

    const options = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10
    };

    const result = await (UserModel as any).aggregatePaginate(
      aggregate,
      options
    );

    return result;
  },

  show: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    return user;
  },

  create: async (userData: IUser) => {
    const { fullName, username, email, phoneNumber, role } = userData;

    if (!fullName || !username || !email || !phoneNumber || !role) {
      throw createHttpError(400, 'Missing required fields');
    }

    if (!['admin', 'customer', 'shop'].includes(role)) {
      throw createHttpError(400, 'Invalid role value');
    }

    if (await UserModel.findOne({ username })) {
      throw createHttpError(409, 'Username already exists');
    }
    if (await UserModel.findOne({ email })) {
      throw createHttpError(409, 'Email already exists');
    }
    if (await UserModel.findOne({ phoneNumber })) {
      throw createHttpError(409, 'Phone number already exists');
    }

    const password = crypto.randomBytes(4).toString('hex');

    const newUser = await UserModel.create({
      fullName,
      username,
      email,
      phoneNumber,
      password,
      role
    });

    if (!newUser) {
      throw createHttpError(400, 'User creation failed');
    }

    await sendMail({
      to: email,
      subject: 'Welcome to Our Service',
      text: `Hello ${fullName},\n\nYour account has been created successfully. Your password is: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nThe Team`
    });

    const { password: _pw, ...resUser } = newUser.toObject();

    return resUser;
  },

  update: async (userId: string, userData: IUser) => {
    const { fullName, username, email, phoneNumber, role } = userData;

    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    if (!fullName || !username || !email || !phoneNumber || !role) {
      throw createHttpError(400, 'Missing required fields');
    }

    if (!['admin', 'customer', 'shop'].includes(role)) {
      throw createHttpError(400, 'Invalid role value');
    }

    if (username && username !== user.username) {
      const dup = await UserModel.findOne({ username, _id: { $ne: userId } });
      if (dup) throw createHttpError(409, 'Username already exists');
      user.username = username;
    }

    if (email && email !== user.email) {
      const dup = await UserModel.findOne({ email, _id: { $ne: userId } });
      if (dup) throw createHttpError(409, 'Email already exists');
      user.email = email;
    }

    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const dup = await UserModel.findOne({
        phoneNumber,
        _id: { $ne: userId }
      });
      if (dup) throw createHttpError(409, 'Phone number already exists');
      user.phoneNumber = phoneNumber;
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (role !== undefined) user.role = role;

    const updatedUser = await user.save();
    if (!updatedUser) throw createHttpError(400, 'User update failed');

    const { password: _pw, ...resUser } = updatedUser.toObject();
    return resUser;
  },

  delete: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }

    const deleted = await UserModel.findByIdAndDelete(userId);
    if (!deleted) throw createHttpError(404, 'User not found');

    return deleted;
  },

  updateAvataUrl: async (userId: string, userData: IUser) => {
    const { avatarUrl } = userData;

    if (!avatarUrl?.trim()) {
      throw createHttpError(400, 'avatarUrl field is required');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }

    const existingUser = await UserModel.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true }
    );
    if (!existingUser) throw createHttpError(404, 'User not found');

    const { password: _pw, ...resUser } = existingUser.toObject();
    return resUser;
  },

  updateCoverUrl: async (userId: string, userData: IUser) => {
    const { coverUrl } = userData;

    if (!coverUrl?.trim()) {
      throw createHttpError(400, 'coverUrl field is required');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }

    const existingUser = await UserModel.findByIdAndUpdate(
      userId,
      { coverUrl },
      { new: true }
    );
    if (!existingUser) throw createHttpError(404, 'User not found');

    const { password: _pw, ...resUser } = existingUser.toObject();
    return resUser;
  },
  updatePassword: async (
    email?: string,
    oldPassword?: string,
    newPassword?: string
  ) => {
    if (!oldPassword || !newPassword) {
      throw createHttpError(400, 'Old Password and New Password are required');
    }
    if (newPassword.length < 6) {
      throw createHttpError(400, 'New Password must be at least 6 characters');
    }

    const user = await UserModel.findOne({ email });
    if (!user) throw createHttpError(404, 'User not found');

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) throw createHttpError(401, 'Incorrect old password');

    user.password = newPassword;
    await user.save();

    return user;
  },

  changePassword: async (userId: string, newPassword: string) => {
    if (!userId || !newPassword) {
      throw createHttpError(400, 'Email and new password are required');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    user.password = newPassword;

    const updatedUser = await user.save();
    if (!updatedUser) throw createHttpError(400, 'User update failed');

    return updatedUser;
  },
};
