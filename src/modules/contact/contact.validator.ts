import { body, query } from "express-validator";
import { checkValidationResult } from "@utils/validation";

export const contactValidator = {
  create: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 100 })
      .withMessage("Name must not exceed 100 characters"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),
    body("phone").optional().trim(),
    body("subject")
      .trim()
      .notEmpty()
      .withMessage("Subject is required")
      .isLength({ max: 200 })
      .withMessage("Subject must not exceed 200 characters"),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ max: 5000 })
      .withMessage("Message must not exceed 5000 characters"),
    body("reason")
      .optional()
      .isIn(["medical-inquiry", "general", "media", "other"])
      .withMessage("Invalid contact reason"),
    checkValidationResult,
  ],

  query: [
    query("isRead").optional().isBoolean().toBoolean(),
    query("reason")
      .optional()
      .isIn(["medical-inquiry", "general", "media", "other"]),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    checkValidationResult,
  ],
};
