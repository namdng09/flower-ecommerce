import { Request, Response } from 'express';
import { Types } from 'mongoose';
import crypto from 'crypto';
import UserModel from './userModel';
import { apiResponse } from '~/types/apiResponse';
import { comparePassword } from '~/utils/bcrypt';
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
  list: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { role = 'all' } = req.query;

      const validRoles = ['admin', 'customer', 'shop'];
      const filter =
        role !== 'all' && validRoles.includes(String(role)) ? { role } : {};

      const users = await UserModel.find(filter).select('-password');
      return res
        .status(200)
        .json(apiResponse.success('Users listed successfully', users));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * GET /users/:id
   * userController.list()
   */
  show: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid user id'));
      }

      const user = await UserModel.findById(id)
        .select('-password')
        .populate('addresses');

      if (!user) {
        return res.status(404).json(apiResponse.error('User not found'));
      }

      return res
        .status(200)
        .json(apiResponse.success('User fetched successfully', user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * POST /users
   * userController.create()
   */
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { fullName, username, email, phoneNumber, role } = req.body;

      if (!fullName || !username || !email || !phoneNumber || !role) {
        return res
          .status(400)
          .json(apiResponse.error('Missing required fields'));
      }

      if (!['admin', 'customer', 'shop'].includes(role)) {
        return res.status(400).json(apiResponse.error('Invalid role value'));
      }

      if (await UserModel.findOne({ username })) {
        return res
          .status(409)
          .json(apiResponse.error('Username already exists'));
      }

      if (await UserModel.findOne({ email })) {
        return res.status(409).json(apiResponse.error('Email already exists'));
      }

      if (await UserModel.findOne({ phoneNumber })) {
        return res
          .status(409)
          .json(apiResponse.error('Phone number already exists'));
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
        return res.status(400).json(apiResponse.error('User creation failed'));
      }

      /* ---- TODO: gửi email/notify password cho user ---- */
      // await sendMail({ ... })

      return res
        .status(201)
        .json(apiResponse.success('User created successfully', newUser));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(msg));
    }
  },

  /**
   * PUT /users/:id/profile
   * userController.update()
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { fullName, username, email, phoneNumber, role } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid user id'));
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json(apiResponse.error('User not found'));
      }

      if (!fullName || !username || !email || !phoneNumber || !role) {
        return res
          .status(400)
          .json(apiResponse.error('Missing required fields'));
      }

      if (!['admin', 'customer', 'shop'].includes(role)) {
        return res.status(400).json(apiResponse.error('Invalid role value'));
      }

      if (username && username !== user.username) {
        const dup = await UserModel.findOne({ username, _id: { $ne: id } });
        if (dup) {
          return res
            .status(409)
            .json(apiResponse.error('Username already exists'));
        }
        user.username = username;
      }

      if (email && email !== user.email) {
        const dup = await UserModel.findOne({ email, _id: { $ne: id } });
        if (dup) {
          return res
            .status(409)
            .json(apiResponse.error('Email already exists'));
        }
        user.email = email;
      }

      if (phoneNumber && phoneNumber !== user.phoneNumber) {
        const dup = await UserModel.findOne({ phoneNumber, _id: { $ne: id } });
        if (dup) {
          return res
            .status(409)
            .json(apiResponse.error('Phone number already exists'));
        }
        user.phoneNumber = phoneNumber;
      }

      if (fullName !== undefined) user.fullName = fullName;
      if (username !== undefined) user.username = username;
      if (email !== undefined) user.email = email;
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
      if (role !== undefined) user.role = role;

      const updatedUser = await user.save();

      if (!updatedUser) {
        return res.status(400).json(apiResponse.error('User creation failed'));
      }

      return res
        .status(200)
        .json(apiResponse.success('Profile updated successfully', updatedUser));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * PATCH /users/:id/avatar
   * userController.updateAvatarUrl()
   */
  updateAvatarUrl: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { avatarUrl } = req.body;

      if (!avatarUrl?.trim()) {
        return res
          .status(400)
          .json(apiResponse.error('avatarUrl field is required'));
      }

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid user id'));
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        { avatarUrl },
        { new: true }
      );
      if (!user) {
        return res.status(404).json(apiResponse.error('User not found'));
      }

      return res
        .status(200)
        .json(apiResponse.success('Avatar updated successfully', user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * PATCH /users/:id/cover
   * userController.updateCoverUrl()
   */
  updateCoverUrl: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { coverUrl } = req.body;

      if (!coverUrl?.trim()) {
        return res
          .status(400)
          .json(apiResponse.error('coverUrl field is required'));
      }

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid user id'));
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        { coverUrl },
        { new: true }
      );
      if (!user) {
        return res.status(404).json(apiResponse.error('User not found'));
      }

      return res
        .status(200)
        .json(apiResponse.success('Cover photo updated successfully', user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * DELETE /users/:id
   * userController.remove()   — Xoá user
   */
  remove: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid user id'));
      }

      const deleted = await UserModel.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json(apiResponse.error('User not found'));
      }

      return res
        .status(200)
        .json(apiResponse.success('User removed successfully'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * PATCH /users/:id
   * userController.updatePassword()
   */
  updatePassword: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid user id'));
      }
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json(
            apiResponse.error('Old Password and New Password are required')
          );
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json(
            apiResponse.error('New Password must be at least 6 characters')
          );
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json(apiResponse.error('User not found'));
      }

      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json(apiResponse.error('Incorrect old password'));
      }

      user.password = newPassword;
      await user.save();

      return res
        .status(200)
        .json(apiResponse.success('Password updated successfully'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  }
};
