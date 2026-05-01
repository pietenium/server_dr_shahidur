import type { Document, Types } from "mongoose";
import type { PaginateModel } from "mongoose-paginate-v2";

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MODERATOR";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Corrected type - now properly using PaginateModel with generics
export type UserModel = PaginateModel<
  IUser,
  Record<string, never>,
  IUserMethods
>;

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

export interface JwtAccessPayload {
  _id: string;
  role: "ADMIN" | "MODERATOR";
}

export interface JwtRefreshPayload {
  _id: string;
  jti: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
