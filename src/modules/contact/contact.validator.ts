import { body, query, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "@utils/ApiError";
import type { Request, Response, NextFunction } from "express";

const checkValidationResult = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Validation Error",
      errors.array().map((err) => ({
        field: err.type === "field" ? err.path : undefined,
        message: err.msg as string,
      }))
    );
  }
  next();
};

export const contactValidator = {
  create: [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("phone").optional().trim(),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
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
