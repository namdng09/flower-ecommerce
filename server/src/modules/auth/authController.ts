import { Request, Response, NextFunction } from 'express';
import { authService } from './authService';
import { apiResponse } from '~/types/apiResponse';
import { IUser } from '../user/userEntity';
import passport from 'passport';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import LoginHistoryRepository from '~/modules/loginHistory/loginHistoryRepository';

const authController = {
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userData: IUser = req.body;
      console.log(userData);
      const newUser = await authService.register(userData);

      await authController.saveLoginHistories(
        newUser.createdUser.id,
        req,
        res,
        next
      );

      res.cookie('refreshToken', newUser.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(201).json(
        apiResponse.success('User created successfully', {
          accessToken: newUser.accessToken,
          user: {
            id: newUser.createdUser.id,
            fullName: newUser.createdUser.fullName,
            email: newUser.createdUser.email,
            username: newUser.createdUser.username,
            phoneNumber: newUser.createdUser.phoneNumber
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
      await authController.saveLoginHistories(user.user.id, req, res, next);

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

  /** POST /auth/google/callback */
  async loginWithGoogle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const profile = req.user as passport.Profile;

      const email = profile.emails?.[0]?.value || '';

      const result = await authService.loginWithGoogle({
        googleId: profile.id,
        email: email,
        fullName: profile.displayName,
        username: email.split('@')[0],
        avatarUrl: profile.photos?.[0]?.value
      });

      await authController.saveLoginHistories(result.user.id, req, res, next);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.redirect(
        `${process.env.CLIENT_URL}/home?accessToken=${result.accessToken}`
      );
    } catch (error) {
      next(error);
    }
  },

  /** POST /auth/google/callback */
  async loginDashboardWithGoogle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const profile = req.user as passport.Profile;

      const result = await authService.loginDashboardWithGoogle({
        googleId: profile.id,
        email: profile.emails?.[0]?.value || ''
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(200).json(
        apiResponse.success('Login successful', {
          accessToken: result.accessToken,
          user: {
            id: result.user.id,
            email: result.user.email
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

  async requestResetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { email } = req.body as { email: string };

      const user = await authService.requestResetPassword(email);

      return res.status(200).json(
        apiResponse.success('Reset password email sent successfully', {
          user: user
        })
      );
    } catch (error) {
      next(error);
    }
  },

  async saveLoginHistories(
    userId: string,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let ip: any =
        req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        '';
      ip = ip.split(',')[0];
      if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0];
      }

      const geo = geoip.lookup(ip as string);

      const ua = new UAParser(req.headers['user-agent']);
      const userAgent = ua.getResult();

      const location = geo ? [geo.city, geo.region, geo.country] : [];

      await LoginHistoryRepository.create({
        user: userId,
        ip: ip,
        browser: userAgent.browser.name
          ? `${userAgent.browser.name}/${userAgent.browser.version}`
          : null,
        os: userAgent.os.name
          ? `${userAgent.os.name}/${userAgent.os.version}`
          : null,
        device: userAgent.device.vendor
          ? `${userAgent.device.vendor}/${userAgent.device.model}`
          : null,
        location: location.filter(Boolean).join(', ')
      });
    } catch (error) {
      console.error('Failed to save login history:', error);
      next(error);
    }
  }
};

export default authController;
