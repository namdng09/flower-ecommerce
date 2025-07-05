import { Request, Response, NextFunction } from 'express';
import { authService } from './authService';
import { generateToken, verifyRefreshToken } from '~/utils/jwt';
import { comparePassword } from '~/utils/bcrypt';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendMail } from '~/utils/mailer';
import { IUser } from '../user/userModel';

const authController = {
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userData: IUser = req.body;

      const newUser = await authService.register(userData)

      res.cookie('refreshToken', newUser.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(201).json(
        apiResponse.success('User created successfully', {
          accessToken: newUser.accessToken,
          user: {
            id: newUser.newUser.id,
            fullName: newUser.newUser.fullName,
            email: newUser.newUser.email,
            username: newUser.newUser.username,
            phoneNumber: newUser.newUser.phoneNumber
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
      const userData: IUser = req.body;

      const user = await authService.login(userData);

      res.cookie('refreshToken', user.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(200).json(
        apiResponse.success('Login successful', {
          accessToken: user.accessToken,
          user: {
            id: user.user.id,
            email: user.user.email
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
      const { refreshToken } = _req.cookies;

      const result = await authService.logout(refreshToken);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(200).json(
        apiResponse.success('Logout successful', {
          message: result.message
        })
      );
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

      const accessToken = await authService.refreshToken(refreshToken);

      return res.status(200).json(
        apiResponse.success('Token refreshed successfully', {
          accessToken: accessToken
        })
      );
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { email } = req.body as { email: string };

      const newPasswordPlain = await authService.resetPassword(email);

      return res.json({
        message: 'New password has been generated and emailed to you.',
        user: {
          email: email,
          newPassword: newPasswordPlain
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
