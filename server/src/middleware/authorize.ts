import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { IUser } from '~/modules/user/userModel';

export const authorize =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser | undefined;
    if (!user) {
      throw createHttpError(401, 'Unauthenticated');
    }

    if (!allowedRoles.includes(user.role)) {
      throw createHttpError(403, 'Forbidden');
    }

    next();
  };
