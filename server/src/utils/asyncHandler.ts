import { Request, Response, NextFunction } from 'express';

/**
 * @description Async handler to catch errors in async routes
 * @param fn - The async function to handle
 * @returns A function that takes req, res, and next as arguments
 */
export const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
