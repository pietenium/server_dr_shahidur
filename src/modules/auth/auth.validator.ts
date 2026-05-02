import { body, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";

const checkValidationResult = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.type === "field" ? err.path : undefined,
      message: err.msg as string,
    }));
    return next(
      new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", formattedErrors),
    );
  }
  next();
};

export const authValidator = {
  login: [
    body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    checkValidationResult,
  ],
  forgotPassword: [
    body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    checkValidationResult,
  ],
  verifyOtp: [
    body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    body("otp")
      .isString()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be exactly 6 characters"),
    checkValidationResult,
  ],
  magicLogin: [
    body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    body("magicToken").isUUID().withMessage("Invalid magic token format"),
    checkValidationResult,
  ],
  resetPassword: [
    body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    body("magicToken").isUUID().withMessage("Invalid magic token format"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    checkValidationResult,
  ],
};
