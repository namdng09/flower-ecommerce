import UserModel, { IUser } from '../user/userModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { comparePassword } from '~/utils/bcrypt';
import { generateToken, verifyRefreshToken } from '~/utils/jwt';
import { sendMail } from '~/utils/mailer';
import crypto from 'crypto';
import { mailService } from '../email/emailService';

export const authService = {
  register: async (userData: IUser) => {
    const { fullName, username, email, phoneNumber, role, password } = userData;

    if (
      !fullName ||
      !username ||
      !email ||
      !phoneNumber ||
      !role ||
      !password
    ) {
      throw createHttpError(400, 'Missing required fields');
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }, { phoneNumber }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw createHttpError(400, 'Email already exists');
      }
      if (existingUser.username === username) {
        throw createHttpError(400, 'Username already exists');
      }
      if (existingUser.phoneNumber === phoneNumber) {
        throw createHttpError(400, 'Phone number already exists');
      }
    }

    const createdUser = await UserModel.create({
      fullName,
      username,
      email,
      phoneNumber,
      role,
      password
    });
    if (!createdUser) throw createHttpError(400, 'User creation failed');

    const { accessToken, refreshToken } = generateToken({
      id: createdUser.id,
      role: createdUser.role
    });

    return { createdUser, accessToken, refreshToken };
  },

  login: async (userData: IUser) => {
    const { email, password } = userData;

    const user = await UserModel.findOne({ email });
    if (!user) throw createHttpError(400, 'Invalid email or password');

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid)
      throw createHttpError(400, 'Invalid email or password');

    const { accessToken, refreshToken } = generateToken({
      id: user.id,
      role: user.role
    });

    return { user, accessToken, refreshToken };
  },

  loginWithGoogle: async (googleUser: {
    googleId: string;
    email: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  }) => {
    let user = await UserModel.findOne({
      $or: [{ googleId: googleUser.googleId }, { email: googleUser.email }]
    }).select('-password');

    if (!user) {
      user = await UserModel.create({
        googleId: googleUser.googleId,
        email: googleUser.email,
        fullName: googleUser.fullName,
        username: googleUser.username,
        avatarUrl: googleUser.avatarUrl,
        role: 'customer'
      });
    } else if (!user.googleId) {
      user.googleId = googleUser.googleId;
      await user.save();
    }

    const { accessToken, refreshToken } = generateToken({
      id: user.id,
      role: user.role
    });

    return { user, accessToken, refreshToken };
  },

  loginDashboardWithGoogle: async (googleUser: {
    googleId: string;
    email: string;
  }) => {
    let user = await UserModel.findOne({ email: googleUser.email });

    if (!user || !['shop', 'admin'].includes(user.role)) {
      throw createHttpError(401, 'Account not found or not permitted');
    } else if (!user.googleId) {
      user.googleId = googleUser.googleId;
      await user.save();
    }

    const { accessToken, refreshToken } = generateToken({
      id: user.id,
      role: user.role
    });

    return { user, accessToken, refreshToken };
  },

  logout: async (refreshToken?: string) => {
    if (!refreshToken) {
      throw createHttpError(401, 'No refresh token provided');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const userId = typeof decoded === 'string' ? decoded : decoded.id;

    return {
      userId: userId,
      message: 'User logged out successfully'
    };
  },

  refreshToken: async (refreshToken: string) => {
    if (!refreshToken) throw createHttpError(401, 'No refresh token provided');

    const decoded = verifyRefreshToken(refreshToken);
    const id = typeof decoded === 'string' ? decoded : decoded.id;

    const { accessToken } = generateToken({
      id: id,
      role: (decoded as { role: string }).role
    });

    return accessToken;
  },

  requestResetPassword: async (email: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const resetLink = "http://localhost:5173/auth/change-password"

    // Gửi email qua emailService với template động
    await mailService.sendResetPassword(email, resetLink, user.fullName);

    return {
      message: 'Reset password email sent successfully',
      user: user,
    };
  }
};
