import { Request, Response } from 'express';
import UserModel from '../user/userModel';
import { generateToken, verifyToken } from '~/utils/jwt';
import { comparePassword } from '~/utils/bcrypt';
import { apiResponse } from '~/types/apiResponse';

const authController = {
  async register(req: Request, res: Response) {
    const { username, email, password } = req.body;

    try {
      const existingUser = await UserModel.findOne({
        email: email
      });
      if (existingUser) {
        return res.status(400).json(apiResponse.failed('User already exists'));
      }

      const newUser = await UserModel.create({
        username,
        email,
        password
      });

      if (!newUser) {
        return res.status(400).json(apiResponse.failed('User creation failed'));
      }

      const { accessToken, refreshToken } = generateToken(
        newUser.id.toString()
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(201).json(
        apiResponse.success('User created successfully', {
          accessToken: accessToken,
          user: {
            id: newUser.id,
            email: newUser.email
          }
        })
      );
    } catch (error) {
      console.error('Error registering user:', error);
      return res.status(500).json(apiResponse.error('Internal server error'));
    }
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await UserModel.findOne({
        email: email
      });
      if (!user) {
        return res
          .status(400)
          .json(apiResponse.failed('Invalid email or password'));
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json(apiResponse.failed('Invalid email or password'));
      }

      const { accessToken, refreshToken } = generateToken(user.id.toString());

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(200).json(
        apiResponse.success('Login successful', {
          accessToken: accessToken,
          user: {
            id: user.id,
            email: user.email
          }
        })
      );
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json(apiResponse.error('Internal server error'));
    }
  },
  async logout(req: Request, res: Response) {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return res.status(200).json(apiResponse.success('Logout successful'));
    } catch (error) {
      console.error('Error logging out:', error);
      return res.status(500).json(apiResponse.error('Internal server error'));
    }
  },
  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(401)
        .json(apiResponse.failed('No refresh token provided'));
    }

    try {
      const decoded = verifyToken(refreshToken);
      const userId = (decoded as { userId: string }).userId;

      const newAccessToken = generateToken(userId);

      return res.status(200).json(
        apiResponse.success('Token refreshed successfully', {
          accessToken: newAccessToken
        })
      );
    } catch (error) {
      console.error('Error refreshing token:', error);
      return res.status(401).json(apiResponse.failed('Invalid refresh token'));
    }
  }
};

export default authController;
