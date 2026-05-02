import { body, validationResult } from "express-validator";
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

export const testimonialValidator = {
  create: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string"),
    
    body("designation")
      .optional()
      .trim()
      .isString()
      .withMessage("Designation must be a string"),

    body("company")
      .optional()
      .trim()
      .isString()
      .withMessage("Company must be a string"),

    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isString()
      .withMessage("Content must be a string"),

    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    body("isVisible")
      .optional()
      .isBoolean()
      .withMessage("isVisible must be a boolean"),

    body("image")
      .optional()
      .isObject()
      .withMessage("Image must be an object"),
    body("image.url").optional().isString(),
    body("image.fileId").optional().isString(),

    body("video")
      .optional()
      .isObject()
      .withMessage("Video must be an object"),
    body("video.url").optional().isString(),
    body("video.fileId").optional().isString(),

    checkValidationResult,
  ],

  update: [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isString()
      .withMessage("Name must be a string"),

    body("designation")
      .optional()
      .trim()
      .isString()
      .withMessage("Designation must be a string"),

    body("company")
      .optional()
      .trim()
      .isString()
      .withMessage("Company must be a string"),

    body("content")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Content cannot be empty")
      .isString()
      .withMessage("Content must be a string"),

    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    body("isVisible")
      .optional()
      .isBoolean()
      .withMessage("isVisible must be a boolean"),

    body("image")
      .optional()
      .isObject()
      .withMessage("Image must be an object"),
    body("image.url").optional().isString(),
    body("image.fileId").optional().isString(),

    body("video")
      .optional()
      .isObject()
      .withMessage("Video must be an object"),
    body("video.url").optional().isString(),
    body("video.fileId").optional().isString(),

    checkValidationResult,
  ],
};
