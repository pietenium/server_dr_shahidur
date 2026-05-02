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

export const researchValidator = {
  create: [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .isLength({ max: 200 })
      .withMessage("Title must not exceed 200 characters"),

    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),

    body("uploadType")
      .trim()
      .notEmpty()
      .withMessage("Upload type is required")
      .isIn(["PDF", "DOI"])
      .withMessage("Upload type must be either PDF or DOI"),

    body("doiUrl")
      .optional()
      .isString()
      .withMessage("DOI URL must be a string")
      .custom((value, { req }) => {
        const reqBody = req.body as Record<string, unknown>;
        if (reqBody.uploadType === "DOI" && !value) {
          throw new Error("DOI URL is required when upload type is DOI");
        }
        return true;
      }),

    body("status")
      .optional()
      .isIn(["DRAFT", "PUBLISHED"])
      .withMessage("Status must be either DRAFT or PUBLISHED"),

    body("publishedAt")
      .optional()
      .isISO8601()
      .withMessage("publishedAt must be a valid ISO8601 date string"),

    body("pdfFile")
      .optional()
      .isObject()
      .withMessage("pdfFile must be an object"),
    body("pdfFile.url").optional().isString(),
    body("pdfFile.fileId").optional().isString(),

    body("thumbnailImage")
      .optional()
      .isObject()
      .withMessage("thumbnailImage must be an object"),
    body("thumbnailImage.url").optional().isString(),
    body("thumbnailImage.fileId").optional().isString(),

    checkValidationResult,
  ],

  update: [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty if provided")
      .isString()
      .withMessage("Title must be a string")
      .isLength({ max: 200 })
      .withMessage("Title must not exceed 200 characters"),

    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),

    body("uploadType")
      .optional()
      .isIn(["PDF", "DOI"])
      .withMessage("Upload type must be either PDF or DOI"),

    body("doiUrl")
      .optional()
      .isString()
      .withMessage("DOI URL must be a string"),

    body("status")
      .optional()
      .isIn(["DRAFT", "PUBLISHED"])
      .withMessage("Status must be either DRAFT or PUBLISHED"),

    body("publishedAt")
      .optional()
      .isISO8601()
      .withMessage("publishedAt must be a valid ISO8601 date string"),

    body("pdfFile")
      .optional()
      .isObject()
      .withMessage("pdfFile must be an object"),
    body("pdfFile.url").optional().isString(),
    body("pdfFile.fileId").optional().isString(),

    body("thumbnailImage")
      .optional()
      .isObject()
      .withMessage("thumbnailImage must be an object"),
    body("thumbnailImage.url").optional().isString(),
    body("thumbnailImage.fileId").optional().isString(),

    checkValidationResult,
  ],

  query: [
    query("status")
      .optional()
      .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
      .withMessage("Invalid status filter"),
    
    query("uploadType")
      .optional()
      .isIn(["PDF", "DOI"])
      .withMessage("Invalid uploadType filter"),

    query("search")
      .optional()
      .isString()
      .withMessage("Search must be a string"),

    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    checkValidationResult,
  ],
};
