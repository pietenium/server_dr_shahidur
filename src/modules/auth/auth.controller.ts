import { env } from "@config/env";
import { AUTH_MESSAGES } from "@constants/messages.constant";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { asyncHandler } from "@utils/asyncHandler";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  MagicLoginPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from "./auth.interface";
import { authService } from "./auth.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite:
    env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
};

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.login(req.body as LoginPayload);

    req.user = {
      _id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      data: { user, accessToken: tokens.accessToken },
    });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body as ForgotPasswordPayload);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: AUTH_MESSAGES.OTP_SENT,
      data: null,
    });
  }),

  verifyOtp: asyncHandler(async (req: Request, res: Response) => {
    const { magicToken } = await authService.verifyOtp(
      req.body as VerifyOtpPayload,
    );

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: AUTH_MESSAGES.OTP_VERIFIED,
      data: { magicToken },
    });
  }),

  magicLogin: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.magicLogin(
      req.body as MagicLoginPayload,
    );

    req.user = {
      _id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: AUTH_MESSAGES.MAGIC_LOGIN_SUCCESS,
      data: { user, accessToken: tokens.accessToken },
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.resetPassword(
      req.body as ResetPasswordPayload,
    );

    req.user = {
      _id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
      data: null,
    });
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token is missing");
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: AUTH_MESSAGES.TOKEN_REFRESHED,
      data: { accessToken: tokens.accessToken },
    });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken");

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: AUTH_MESSAGES.LOGOUT_SUCCESS,
      data: null,
    });
  }),
};
