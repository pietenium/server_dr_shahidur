import { query, validationResult } from "express-validator";
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

export const searchValidator = {
  query: [
    query("q")
      .trim()
      .notEmpty()
      .withMessage("Search query (q) is required")
      .isLength({ min: 2 })
      .withMessage("Search query must be at least 2 characters long"),
    
    query("type")
      .optional()
      .isIn(["article", "research", "testimonial"])
      .withMessage("Invalid search type"),
    
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50")
      .toInt(),

    checkValidationResult,
  ],
};
