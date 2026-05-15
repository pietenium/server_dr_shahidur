import { checkValidationResult } from "@utils/validation";
import { body } from "express-validator";

export const authValidator = {
  login: [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    checkValidationResult,
  ],
  forgotPassword: [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    checkValidationResult,
  ],
  verifyOtp: [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("otp")
      .isString()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be exactly 6 characters"),
    checkValidationResult,
  ],
  magicLogin: [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("magicToken")
      .notEmpty()
      .isString()
      .withMessage("Magic token is required"),
    checkValidationResult,
  ],
  resetPassword: [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("magicToken")
      .notEmpty()
      .isString()
      .withMessage("Magic token is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    checkValidationResult,
  ],
};
