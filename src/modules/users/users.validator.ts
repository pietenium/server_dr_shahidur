import { checkValidationResult } from "@utils/validation";
import { body, param, query } from "express-validator";

export const usersValidator = {
  updateProfile: [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    checkValidationResult,
  ],

  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      )
      .withMessage(
        "New password must contain uppercase, lowercase, number and special character",
      ),
    checkValidationResult,
  ],

  inviteModerator: [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    checkValidationResult,
  ],

  getAllUsers: [
    query("role").optional().isIn(["ADMIN", "MODERATOR"]),
    query("isActive").optional().isBoolean().toBoolean(),
    query("search").optional().isString().trim(),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    checkValidationResult,
  ],

  validateId: [
    param("id").isMongoId().withMessage("Invalid user ID"),
    checkValidationResult,
  ],
};
