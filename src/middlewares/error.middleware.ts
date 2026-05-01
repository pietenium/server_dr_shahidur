import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "@utils/ApiError";
import { env } from "@config/env";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  const errors: Array<{ field?: string; message: string }> = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors.push(...err.errors);
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation Error";
    Object.values(err.errors).forEach((error) => {
      errors.push({
        field: error.path,
        message: error.message,
      });
    });
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
  }

  if (env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message:
      env.NODE_ENV === "production" && statusCode === 500
        ? "Internal Server Error"
        : message,
    errors,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
