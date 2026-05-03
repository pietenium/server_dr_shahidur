import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { authService } from "./auth.service";
import type {
  LoginPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  MagicLoginPayload,
  ResetPasswordPayload,
} from "./auth.interface";
import { env } from "@config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
      message: "Login successful",
      data: { user, accessToken: tokens.accessToken },
    });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body as ForgotPasswordPayload);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "If an account exists, an OTP and magic link have been sent to the email.",
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
      message: "OTP verified successfully",
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
      message: "Login successful",
      data: { user, accessToken: tokens.accessToken },
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body as ResetPasswordPayload);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Password has been reset successfully.",
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
      message: "Token refreshed successfully",
      data: { accessToken: tokens.accessToken },
    });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken");

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  }),
};
