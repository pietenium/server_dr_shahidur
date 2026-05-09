import { body, param } from "express-validator";
import { checkValidationResult } from "@utils/validation";

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

    body("image").optional().isObject().withMessage("Image must be an object"),
    body("image.url").optional().isString(),
    body("image.fileId").optional().isString(),

    body("video").optional().isObject().withMessage("Video must be an object"),
    body("video.url").optional().isString(),
    body("video.fileId").optional().isString(),

    checkValidationResult,
  ],

  update: [
    param("id").isMongoId().withMessage("Invalid testimonial ID"),
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

    body("image").optional().isObject().withMessage("Image must be an object"),
    body("image.url").optional().isString(),
    body("image.fileId").optional().isString(),

    body("video").optional().isObject().withMessage("Video must be an object"),
    body("video.url").optional().isString(),
    body("video.fileId").optional().isString(),

    checkValidationResult,
  ],

  validateId: [
    param("id").isMongoId().withMessage("Invalid testimonial ID"),
    checkValidationResult,
  ],
};
