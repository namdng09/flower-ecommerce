import mongoose, { PaginateModel } from 'mongoose';
import UserEntity, { IUser } from './userEntity';

export interface UserDocument extends mongoose.Document, IUser {}
export type UserPaginateModel = mongoose.PaginateModel<UserDocument>;

const UserRepository = mongoose.model<
  UserDocument,
  PaginateModel<UserDocument>
>('User', UserEntity);

export default UserRepository;
