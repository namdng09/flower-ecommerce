import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import createHttpError from 'http-errors';

const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (
      err: unknown,
      user: Express.User | false,
      info: { message?: string } | undefined
    ) => {
      if (err) throw err;

      if (!user) {
        throw createHttpError(401, info?.message || 'Unauthorized');
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};

export default jwtAuth;
