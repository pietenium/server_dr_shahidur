import { query, body, validationResult } from "express-validator";
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

export const activityLogValidator = {
  query: [
    query("user")
      .optional()
      .isMongoId()
      .withMessage("user must be a valid MongoDB ObjectId"),

    query("module")
      .optional()
      .isString()
      .withMessage("module must be a string"),

    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("startDate must be a valid ISO8601 date"),

    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("endDate must be a valid ISO8601 date"),

    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be between 1 and 100"),

    checkValidationResult,
  ],

  bulkDelete: [
    body("ids")
      .isArray({ min: 1 })
      .withMessage("ids must be a non-empty array"),

    body("ids.*")
      .isMongoId()
      .withMessage("Each id must be a valid MongoDB ObjectId"),

    checkValidationResult,
  ],
};
