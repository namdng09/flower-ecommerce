import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler
} from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './configs/db';
import router from './routes/router';
import passport from 'passport';
import configurePassport from './utils/passport';
import { apiResponse } from './types/apiResponse';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
connectDB();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

configurePassport();
app.use(passport.initialize());

app.use('/api', router);

app.use((req: Request, res: Response, next: NextFunction) => {
  const message = `API route [${req.method}] ${req.originalUrl} not found`;
  res.status(404).json(apiResponse.failed(message));
});

app.use(errorHandler);

export default app;
