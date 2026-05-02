import { body, param, query } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
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

export const articleValidator = {
  create: [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("excerpt").optional().trim(),
    body("category").isMongoId().withMessage("Invalid category ID"),
    body("articleType")
      .toUpperCase()
      .isIn(["MEDICAL", "POLITICAL"])
      .withMessage("Type must be MEDICAL or POLITICAL"),
    body("status").optional().toUpperCase().isIn(["DRAFT", "PUBLISHED"]),
    body("author").optional().trim(),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("featuredImage").optional().isObject(),
    body("ogImage").optional().isObject(),
    checkValidationResult,
  ],

  update: [
    param("id").isMongoId().withMessage("Invalid article ID"),
    body("title").optional().trim().notEmpty(),
    body("content").optional().notEmpty(),
    body("category").optional().isMongoId(),
    body("articleType").optional().toUpperCase().isIn(["MEDICAL", "POLITICAL"]),
    body("status").optional().toUpperCase().isIn(["DRAFT", "PUBLISHED"]),
    checkValidationResult,
  ],

  createCategory: [
    body("name").trim().notEmpty().withMessage("Category name is required"),
    body("description").optional().trim(),
    checkValidationResult,
  ],

  updateCategory: [
    param("id").isMongoId().withMessage("Invalid category ID"),
    body("name").optional().trim().notEmpty(),
    checkValidationResult,
  ],

  query: [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
    query("status").optional().toUpperCase().isIn(["DRAFT", "PUBLISHED"]),
    query("articleType").optional().toUpperCase().isIn(["MEDICAL", "POLITICAL"]),
    query("category").optional().isMongoId(),
    checkValidationResult,
  ],
};
