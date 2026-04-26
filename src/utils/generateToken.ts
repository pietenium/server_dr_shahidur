import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "@config/env";
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from "@modules/auth/auth.interface";

export const generateTokenJti = (): string => {
  return uuidv4();
};

export const generateAccessToken = (payload: JwtAccessPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (payload: JwtRefreshPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
    jwtid: payload.jti,
  });
};
