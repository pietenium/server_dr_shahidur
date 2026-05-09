import { body, param, query } from "express-validator";
import { checkValidationResult } from "@utils/validation";

export const appointmentValidator = {
  create: [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone is required")
      .matches(/^\+8801[3-9]\d{8}$/)
      .withMessage("Invalid Bangladesh phone number format (+8801XXXXXXXXX)"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("preferredDate")
      .notEmpty()
      .withMessage("Date is required")
      .isISO8601()
      .withMessage("Invalid date format")
      .custom((value: unknown) => {
        if (new Date(value as string) < new Date()) {
          throw new Error("Date cannot be in the past");
        }
        return true;
      }),
    body("preferredTime").notEmpty().withMessage("Time is required"),
    body("message").optional().trim(),
    checkValidationResult,
  ],

  query: [
    query("status")
      .optional()
      .toUpperCase()
      .isIn(["PENDING", "CONFIRMED", "CANCELLED"]),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    checkValidationResult,
  ],

  updateStatus: [
    param("id").isMongoId().withMessage("Invalid ID"),
    body("status")
      .notEmpty()
      .toUpperCase()
      .isIn(["CONFIRMED", "CANCELLED"])
      .withMessage("Status must be CONFIRMED or CANCELLED"),
    checkValidationResult,
  ],

  validateId: [
    param("id").isMongoId().withMessage("Invalid appointment ID"),
    checkValidationResult,
  ],
};
