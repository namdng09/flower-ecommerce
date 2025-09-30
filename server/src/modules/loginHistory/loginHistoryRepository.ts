import mongoose, { PaginateModel } from 'mongoose';
import LoginHistoryEntity, { ILoginHistory } from './loginHistoryEntity';

export interface LoginHistoryDocument
  extends mongoose.Document,
    ILoginHistory {}
export type LoginHistoryPaginateModel = PaginateModel<LoginHistoryDocument>;

const LoginHistoryRepository = mongoose.model<
  LoginHistoryDocument,
  LoginHistoryPaginateModel
>('LoginHistory', LoginHistoryEntity);

export default LoginHistoryRepository;
