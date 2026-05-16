import { env } from "@config/env";
import { ApiError } from "@utils/ApiError";
import axios from "axios";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";

interface RecaptchaVerifyResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
}

interface RecaptchaRequestBody {
  recaptchaToken?: string;
}

export const verifyRecaptcha: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as RecaptchaRequestBody;
    const token =
      body.recaptchaToken ??
      (req.headers["x-recaptcha-token"] as string | undefined);

    if (!token) {
      if (env.NODE_ENV !== "production") {
        console.warn("reCAPTCHA token missing — bypassing verification in development mode.");
        return next();
      }
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "reCAPTCHA token is required",
      );
    }

    const response = await axios.post<RecaptchaVerifyResponse>(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: env.RECAPTCHA_V3_SECRET,
          response: token,
        },
      },
    );

    const data = response.data;

    if (!data.success || data.score < 0.5) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "reCAPTCHA verification failed. Please try again.",
      );
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(StatusCodes.BAD_REQUEST, "reCAPTCHA verification failed"),
      );
    }
  }
};
