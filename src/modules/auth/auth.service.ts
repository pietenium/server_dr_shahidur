import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import { User } from "./auth.model";
import { ApiError } from "@utils/ApiError";
import { getRedisClient } from "@config/redis";
import { generateOTP } from "@utils/generateOTP";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenJti,
} from "@utils/generateToken";
import { sendEmail } from "@emails/sendEmail";
import { magicLoginTemplate } from "@emails/template/magic-login.template";
import { passwordChangedTemplate } from "@emails/template/password-changed.template";
import { env } from "@config/env";

import type {
  IUser,
  LoginPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  MagicLoginPayload,
  ResetPasswordPayload,
  AuthTokens,
  JwtRefreshPayload,
} from "./auth.interface";

export const authService = {
  login: async (
    payload: LoginPayload,
  ): Promise<{ user: IUser; tokens: AuthTokens }> => {
    const user = await User.findOne({ email: payload.email });
    if (!user || !(await user.comparePassword(payload.password))) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Account is inactive. Please contact support.",
      );
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const jti = generateTokenJti();
    const accessToken = generateAccessToken({
      _id: user._id.toString(),
      role: user.role,
      jti,
    });
    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      jti,
    });

    return { user, tokens: { accessToken, refreshToken } };
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    if (typeof payload.email !== "string") {
      return;
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const user = await User.findOne({ email: { $eq: normalizedEmail } });

    if (!user) {
      return;
    }

    const otp = generateOTP();
    const magicToken = uuidv4();

    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedMagicToken = await bcrypt.hash(magicToken, 10);

    const redis = getRedisClient();
    await redis.set(`otp:${user._id.toString()}`, hashedOtp, "EX", 600);
    await redis.set(`magic:${user._id.toString()}`, hashedMagicToken, "EX", 600);

    const magicLink = `${env.CLIENT_DASHBOARD_URL}/magic-login?token=${magicToken}&email=${encodeURIComponent(user.email)}`;

    await sendEmail({
      to: user.email,
      subject: "Your OTP and Magic Login Link",
      html: magicLoginTemplate({ name: user.name, otp, magicLink }),
    });
  },

  verifyOtp: async (
    payload: VerifyOtpPayload,
  ): Promise<{ magicToken: string }> => {
    if (typeof payload.email !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP or email");
    }

    const email = payload.email.trim().toLowerCase();
    const user = await User.findOne({ email: { $eq: email } });

    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP or email");
    }

    const redis = getRedisClient();
    const hashedOtp = await redis.get(`otp:${user._id.toString()}`);

    if (!hashedOtp || !(await bcrypt.compare(payload.otp, hashedOtp))) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired OTP");
    }

    // After OTP verification is successful, we don't automatically log them in
    // according to the plan, but we can return success.
    // Wait, the plan says: "retrieve raw magic token from session context... read the hashed magic token from Redis... and return it as-is so frontend can present two options".
    // Wait, the raw magic token is not in redis, only the hashed one. The prompt says "the service must store the raw magic token temporarily - read the hashed magic token from Redis key magic:{userId} and return it as-is".
    // Wait! If the magic token is hashed, we CANNOT retrieve the raw one from redis.
    // The prompt says: "(the service must store the raw magic token temporarily — read the hashed magic token from Redis key magic:{userId} and return it as-is so the frontend can present the two options)".
    // If we return the HASHED token to frontend, then when frontend calls /magic-login, it passes the hashed token.
    // Let's pass the hashed token as "magicToken" for the frontend to use in magicLogin.

    const hashedMagicToken = await redis.get(`magic:${user._id.toString()}`);
    if (!hashedMagicToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Magic token expired");
    }

    // Return the hashed token so frontend can use it to reset password or login
    return { magicToken: hashedMagicToken };
  },

  magicLogin: async (
    payload: MagicLoginPayload,
  ): Promise<{ user: IUser; tokens: AuthTokens }> => {
    if (typeof payload.email !== "string" || payload.email.trim() === "") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid email");
    }

    const email = payload.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid request");
    }

    const redis = getRedisClient();
    const storedHashedMagicToken = await redis.get(`magic:${user._id.toString()}`);

    if (!storedHashedMagicToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Link expired");
    }

    // The frontend may pass either the raw magic token (from email link) or the hashed magic token (from verifyOtp).
    // Let's check both possibilities.
    let isValid: boolean;
    if (payload.magicToken === storedHashedMagicToken) {
      isValid = true; // Passed hashed token from verifyOtp
    } else {
      isValid = await bcrypt.compare(payload.magicToken, storedHashedMagicToken); // Passed raw token from email
    }

    if (!isValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid magic token");
    }

    await redis.del(`otp:${user._id.toString()}`, `magic:${user._id.toString()}`);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const jti = generateTokenJti();
    const accessToken = generateAccessToken({
      _id: user._id.toString(),
      role: user.role,
      jti,
    });
    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      jti,
    });

    return { user, tokens: { accessToken, refreshToken } };
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {

    if (typeof payload.email !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request");
    }
    const user = await User.findOne({ email: { $eq: payload.email } });

    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request");
    }

    const redis = getRedisClient();
    const storedHashedMagicToken = await redis.get(`magic:${user._id.toString()}`);

    if (!storedHashedMagicToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Link expired");
    }

    let isValid: boolean;
    if (payload.magicToken === storedHashedMagicToken) {
      isValid = true;
    } else {
      isValid = await bcrypt.compare(payload.magicToken, storedHashedMagicToken);
    }

    if (!isValid) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid magic token");
    }

    user.password = payload.newPassword;
    await user.save(); // pre-save hook will hash it

    await redis.del(`otp:${user._id.toString()}`, `magic:${user._id.toString()}`);

    // Send confirmation email (Async)
    void sendEmail({
      to: user.email,
      subject: "Password Changed Successfully — Dr. Sahidur Rahman Khan",
      html: passwordChangedTemplate({
        name: user.name,
      }),
    });
  },

  refreshToken: async (token: string): Promise<AuthTokens> => {
    let decoded: JwtRefreshPayload;
    try {
      decoded = jwt.verify(
        token,
        env.JWT_REFRESH_SECRET,
      ) as JwtRefreshPayload;
    } catch {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`blacklist:jti:${decoded.jti}`);
    if (isBlacklisted) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Token has been invalidated");
    }

    const user = await User.findById(decoded._id);
    if (!user || !user.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User inactive or not found");
    }

    // Blacklist old token
    const tokenExp = (jwt.decode(token) as jwt.JwtPayload).exp;
    if (tokenExp) {
      const remainingLifetime = tokenExp - Math.floor(Date.now() / 1000);
      if (remainingLifetime > 0) {
        await redis.set(
          `blacklist:jti:${decoded.jti}`,
          "1",
          "EX",
          remainingLifetime,
        );
      }
    }

    const jti = generateTokenJti();
    const accessToken = generateAccessToken({
      _id: user._id.toString(),
      role: user.role,
      jti,
    });
    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      jti,
    });

    return { accessToken, refreshToken };
  },

  logout: async (token: string): Promise<void> => {
    let decoded: JwtRefreshPayload;
    try {
      decoded = jwt.verify(
        token,
        env.JWT_REFRESH_SECRET,
      ) as JwtRefreshPayload;
    } catch {
      // If token is invalid or expired, no need to blacklist
      return;
    }

    const tokenExp = (jwt.decode(token) as jwt.JwtPayload).exp;
    if (tokenExp) {
      const remainingLifetime = tokenExp - Math.floor(Date.now() / 1000);
      if (remainingLifetime > 0) {
        const redis = getRedisClient();
        await redis.set(
          `blacklist:jti:${decoded.jti}`,
          "1",
          "EX",
          remainingLifetime,
        );
      }
    }
  },
};
