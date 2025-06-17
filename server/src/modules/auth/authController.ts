import { Request, Response, NextFunction } from 'express';
import UserModel from '../user/userModel';
import { generateToken, verifyRefreshToken } from '~/utils/jwt';
import { comparePassword } from '~/utils/bcrypt';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';

const authController = {
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { fullName, username, email, phoneNumber, role, password } =
        req.body;

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
        $or: [{ email }, { username }]
      });
      if (existingUser) {
        if (existingUser.email === email) {
          throw createHttpError(400, 'Email already exists');
        }
        if (existingUser.username === username) {
          throw createHttpError(400, 'Username already exists');
        }
      }

      const newUser = await UserModel.create({
        fullName,
        username,
        email,
        phoneNumber,
        role,
        password
      });
      if (!newUser) throw createHttpError(400, 'User creation failed');

      const { accessToken, refreshToken } = generateToken({
        id: newUser.id,
        role: newUser.role
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(201).json(
        apiResponse.success('User created successfully', {
          accessToken,
          user: {
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
            username: newUser.username,
            phoneNumber: newUser.phoneNumber
          }
        })
      );
    } catch (error) {
      next(error);
    }
  },

  /** POST /auth/login */
  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) throw createHttpError(400, 'Invalid email or password');

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid)
        throw createHttpError(400, 'Invalid email or password');

      const { accessToken, refreshToken } = generateToken({
        id: user.id,
        role: user.role
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(200).json(
        apiResponse.success('Login successful', {
          accessToken,
          user: {
            id: user.id,
            email: user.email
          }
        })
      );
    } catch (error) {
      next(error);
    }
  },

  /** POST /auth/logout */
  async logout(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return res.status(200).json(apiResponse.success('Logout successful'));
    } catch (error) {
      next(error);
    }
  },

  /** POST /auth/refresh-token */
  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken)
        throw createHttpError(401, 'No refresh token provided');

      const decoded = verifyRefreshToken(refreshToken);
      const id = typeof decoded === 'string' ? decoded : decoded.id;

      const { accessToken } = generateToken({
        id: id,
        role: (decoded as { role: string }).role
      });

      return res.status(200).json(
        apiResponse.success('Token refreshed successfully', {
          accessToken: accessToken
        })
      );
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
