import { body, param, query } from "express-validator";
import { checkValidationResult } from "@utils/validation";

export const articleValidator = {
  create: [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("excerpt")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Excerpt cannot be empty"),
    body("category").isMongoId().withMessage("Invalid category ID"),
    body("articleType")
      .toUpperCase()
      .isIn(["MEDICAL", "POLITICAL"])
      .withMessage("Type must be MEDICAL or POLITICAL"),
    body("status").optional().toUpperCase().isIn(["DRAFT", "PUBLISHED"]),
    body("author")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Author cannot be empty"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("featuredImage").optional().isObject(),
    body("ogImage").optional().isObject(),
    checkValidationResult,
  ],

  update: [
    param("id").isMongoId().withMessage("Invalid article ID"),
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty"),
    body("content")
      .optional()
      .notEmpty()
      .withMessage("Content cannot be empty"),
    body("excerpt")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Excerpt cannot be empty"),
    body("category").optional().isMongoId().withMessage("Invalid category ID"),
    body("articleType").optional().toUpperCase().isIn(["MEDICAL", "POLITICAL"]),
    body("status").optional().toUpperCase().isIn(["DRAFT", "PUBLISHED"]),
    body("author")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Author cannot be empty"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("featuredImage").optional().isObject(),
    body("ogImage").optional().isObject(),
    body("publishedAt")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format"),
    checkValidationResult,
  ],

  createCategory: [
    body("name").trim().notEmpty().withMessage("Category name is required"),
    body("description").optional().trim(),
    checkValidationResult,
  ],

  updateCategory: [
    param("id").isMongoId().withMessage("Invalid category ID"),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Category name cannot be empty"),
    checkValidationResult,
  ],

  query: [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("status").optional().toUpperCase().isIn(["DRAFT", "PUBLISHED"]),
    query("articleType")
      .optional()
      .toUpperCase()
      .isIn(["MEDICAL", "POLITICAL"]),
    query("category").optional().isMongoId(),
    query("tag").optional().isString().trim().notEmpty(),
    query("search").optional().isString().trim().notEmpty(),
    checkValidationResult,
  ],

  validateSlug: [
    param("slug").trim().notEmpty().withMessage("Slug is required"),
    checkValidationResult,
  ],

  validateId: [
    param("id").isMongoId().withMessage("Invalid article ID"),
    checkValidationResult,
  ],
};
