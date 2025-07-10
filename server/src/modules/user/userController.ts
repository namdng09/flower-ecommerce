import { Request, Response, NextFunction } from 'express';
import { IUser } from './userModel';
import { userService } from './userService';
import { apiResponse } from '~/types/apiResponse';

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

      const users = await userService.list(role);

      return res
        .status(200)
        .json(apiResponse.success('Users listed successfully', users));
    } catch (error) {
      next(error);
    }
  },

  filterUsers: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const {
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        fullName,
        username,
        email,
        role,
        phoneNumber
      } = req.query as {
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        fullName?: string;
        username?: string;
        email?: string;
        role?: string;
        phoneNumber?: string;
      };

      const result = await userService.filterUsers(
        page,
        limit,
        sortBy,
        sortOrder,
        fullName,
        username,
        email,
        role,
        phoneNumber
      );

      return res.status(200).json(
        apiResponse.success('User listed successfully', {
          result
        })
      );
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
      const { userId } = req.params;

      const user = await userService.show(userId);

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
      const userData: IUser = req.body;

      const resUser = await userService.create(userData);

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
      const { userId } = req.params;
      const userData: IUser = req.body;

      const resUser = await userService.update(userId, userData);

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
      const { userId } = req.params;
      const userData: IUser = req.body;

      const resUser = await userService.updateAvataUrl(userId, userData);

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
      const { userId } = req.params;
      const userData: IUser = req.body;

      const resUser = await userService.updateCoverUrl(userId, userData);

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
      const { userId } = req.params;

      await userService.delete(userId);

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
      const { email } = req.params;
      const { oldPassword, newPassword } = req.body;

      const user = await userService.updatePassword(
        email,
        oldPassword,
        newPassword
      );

      return res
        .status(200)
        .json(apiResponse.success('Password updated successfully', user));
    } catch (error) {
      next(error);
    }
  }
};
