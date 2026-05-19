import { body, param } from "express-validator";
import { checkValidationResult } from "@utils/validation";

export const chemberValidator = {
  create: [
    body("chemberName")
      .trim()
      .notEmpty()
      .withMessage("Chamber name is required"),
    body("map").trim().notEmpty().withMessage("Map embed URL is required"),
    body("activeDates")
      .isArray({ min: 1 })
      .withMessage("At least one active day is required"),
    body("activeDates.*.activeDay").notEmpty().withMessage("Day is required"),
    body("activeDates.*.startTime")
      .notEmpty()
      .withMessage("Start time is required"),
    body("activeDates.*.endTime")
      .notEmpty()
      .withMessage("End time is required"),
    checkValidationResult,
  ],

  update: [
    param("id").isMongoId().withMessage("Invalid chamber ID"),
    body("chemberName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Chamber name cannot be empty"),
    body("map")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Map URL cannot be empty"),
    body("activeDates")
      .optional()
      .isArray({ min: 1 })
      .withMessage("At least one active day is required"),
    checkValidationResult,
  ],

  validateId: [
    param("id").isMongoId().withMessage("Invalid chamber ID"),
    checkValidationResult,
  ],
};
