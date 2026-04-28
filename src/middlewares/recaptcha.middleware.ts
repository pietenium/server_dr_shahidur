import { Request, Response, NextFunction, RequestHandler } from "express";
import axios from "axios";
import { env } from "@config/env";
import { ApiError } from "@utils/ApiError";

interface RecaptchaVerifyResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
}

export const verifyRecaptcha: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.body.recaptchaToken || req.headers["x-recaptcha-token"];

    if (!token) {
      throw new ApiError(400, "reCAPTCHA token is required");
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
        400,
        "reCAPTCHA verification failed. Please try again.",
      );
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(400, "reCAPTCHA verification failed"));
    }
  }
};
