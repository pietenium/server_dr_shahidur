import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { StatusCodes } from "http-status-codes";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "@utils/ApiError";
import { env } from "@config/env";
import { logger } from "@utils/logger";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _: NextFunction,
): void => {
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  const errors: Array<{ field?: string; message: string }> = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors.push(...err.errors);
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation Error";
    Object.values(err.errors).forEach((error) => {
      errors.push({
        field: error.path,
        message: error.message,
      });
    });
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Invalid ID format";
  } else if (err instanceof JsonWebTokenError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = "Invalid token";
  } else if (err instanceof TokenExpiredError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = "Token expired";
  }

  if (env.NODE_ENV === "development") {
    logger.error("Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message:
      env.NODE_ENV === "production" &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      statusCode === StatusCodes.INTERNAL_SERVER_ERROR
        ? "Internal Server Error"
        : message,
    errors,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
