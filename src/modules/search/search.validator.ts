import { query } from "express-validator";
import { checkValidationResult } from "@utils/validation";

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
