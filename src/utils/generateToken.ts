import { env } from "@config/env";
import type {
  JwtAccessPayload,
  JwtRefreshPayload,
} from "@modules/auth/auth.interface";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const generateTokenJti = (): string => {
  return uuidv4();
};

export const generateAccessToken = (payload: JwtAccessPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: JwtRefreshPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};
