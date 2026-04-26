import { Document, Model, Types } from "mongoose";
import { Role } from "../../constants/roles.constant";
import { PaginateResult } from "mongoose-paginate-v2";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  otpCode?: string;
  otpExpiry?: Date;
  magicLoginToken?: string;
  magicLoginExpiry?: Date;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserModel = Model<IUser> & {
  paginate: (
    query?: object,
    options?: object,
  ) => Promise<PaginateResult<IUser>>;
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface MagicLoginPayload {
  email: string;
  magicToken: string;
}

export interface ResetPasswordPayload {
  email: string;
  magicToken: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
