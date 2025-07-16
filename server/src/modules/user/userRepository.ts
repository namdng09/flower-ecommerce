import mongoose, { PaginateModel } from 'mongoose';
import UserEntity, { IUser } from './userEntity';

export interface UserDocument extends mongoose.Document, IUser {}
export type UserPaginateModel = mongoose.PaginateModel<UserDocument>;

const UserModel = mongoose.model<UserDocument, PaginateModel<UserDocument>>(
  'User',
  UserEntity
);

export default UserModel;
