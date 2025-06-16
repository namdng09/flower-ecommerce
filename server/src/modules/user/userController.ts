import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import crypto from 'crypto';
import UserModel from './userModel';
import { apiResponse } from '~/types/apiResponse';
import { comparePassword } from '~/utils/bcrypt';
import createHttpError from 'http-errors';
// import { sendMail } from '~/utils/mailer';   // Giả sử bạn có util gửi mail

/**
 * userController.ts
 *
 * @description :: Server-side logic for managing users.
 *
 */
export const userController = {
  /**
   * GET /users?role=<admin|customer|shop>
   * userController.list()
   */
  list: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { role } = req.query as { role?: string };
      const validRoles = ['admin', 'customer', 'shop'];

      if (role && !validRoles.includes(role)) {
        throw createHttpError(400, 'Invalid role value');
      }

      const filter = role ? { role } : {};
      const users = await UserModel.find(filter).select('-password');

      return res
        .status(200)
        .json(apiResponse.success('Users listed successfully', users));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /users/:id
   * userController.list()
   */
  show: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const user = await UserModel.findById(id)
        .select('-password')
        .populate('addresses');

      if (!user) {
        throw createHttpError(404, 'User not found');
      }

      return res
        .status(200)
        .json(apiResponse.success('User fetched successfully', user));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /users
   * userController.create()
   */
  create: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { fullName, username, email, phoneNumber, role } = req.body;

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

      /* ---- TODO: gửi email/notify password cho user ---- */
      // await sendMail({ ... })

      const { password: _pw, ...resUser } = newUser.toObject();

      return res
        .status(201)
        .json(apiResponse.success('User created successfully', resUser));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /users/:id/profile
   * userController.update()
   */
  update: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { fullName, username, email, phoneNumber, role } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const user = await UserModel.findById(id);
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
        const dup = await UserModel.findOne({ username, _id: { $ne: id } });
        if (dup) throw createHttpError(409, 'Username already exists');
        user.username = username;
      }

      if (email && email !== user.email) {
        const dup = await UserModel.findOne({ email, _id: { $ne: id } });
        if (dup) throw createHttpError(409, 'Email already exists');
        user.email = email;
      }

      if (phoneNumber && phoneNumber !== user.phoneNumber) {
        const dup = await UserModel.findOne({ phoneNumber, _id: { $ne: id } });
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
      return res
        .status(200)
        .json(apiResponse.success('Profile updated successfully', resUser));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /users/:id/avatar
   * userController.updateAvatarUrl()
   */
  updateAvatarUrl: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { avatarUrl } = req.body;

      if (!avatarUrl?.trim()) {
        throw createHttpError(400, 'avatarUrl field is required');
      }
      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const existingUser = await UserModel.findByIdAndUpdate(
        id,
        { avatarUrl },
        { new: true }
      );
      if (!existingUser) throw createHttpError(404, 'User not found');

      const { password: _pw, ...resUser } = existingUser.toObject();
      return res
        .status(200)
        .json(apiResponse.success('Avatar updated successfully', resUser));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /users/:id/cover
   * userController.updateCoverUrl()
   */
  updateCoverUrl: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { coverUrl } = req.body;

      if (!coverUrl?.trim()) {
        throw createHttpError(400, 'coverUrl field is required');
      }
      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const existingUser = await UserModel.findByIdAndUpdate(
        id,
        { coverUrl },
        { new: true }
      );
      if (!existingUser) throw createHttpError(404, 'User not found');

      const { password: _pw, ...resUser } = existingUser.toObject();
      return res
        .status(200)
        .json(apiResponse.success('Cover photo updated successfully', resUser));
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /users/:id
   * userController.remove()   — Xoá user
   */
  remove: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const deleted = await UserModel.findByIdAndDelete(id);
      if (!deleted) throw createHttpError(404, 'User not found');

      return res
        .status(200)
        .json(apiResponse.success('User removed successfully'));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /users/:id
   * userController.updatePassword()
   */
  updatePassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }
      if (!oldPassword || !newPassword) {
        throw createHttpError(
          400,
          'Old Password and New Password are required'
        );
      }
      if (newPassword.length < 6) {
        throw createHttpError(
          400,
          'New Password must be at least 6 characters'
        );
      }

      const user = await UserModel.findById(id);
      if (!user) throw createHttpError(404, 'User not found');

      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) throw createHttpError(401, 'Incorrect old password');

      user.password = newPassword;
      await user.save();

      return res
        .status(200)
        .json(apiResponse.success('Password updated successfully'));
    } catch (error) {
      next(error);
    }
  }
};
