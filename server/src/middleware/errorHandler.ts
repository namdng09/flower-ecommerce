import { Request, Response, ErrorRequestHandler } from 'express';
import { apiResponse } from '~/types/apiResponse';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response
): void => {
  const status = err.status || err.statusCode || 500;

  if (status >= 400 && status < 500) {
    const message = err.message || 'Client Error';
    res.status(status).json(apiResponse.failed(message));
    return;
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Something went wrong';

  res.status(500).json(apiResponse.error(message));
};
