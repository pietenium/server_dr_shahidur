import { checkValidationResult } from "@utils/validation";
import { body, param, query } from "express-validator";

export const analyticsValidator = {
  track: [
    body("page").notEmpty().withMessage("Page is required"),
    body("sessionId").notEmpty().withMessage("Session ID is required"),
    body("visitorId").optional().isString(),
    body("referrer").optional().isString(),
    checkValidationResult,
  ],

  // New: Track custom event validation
  trackEvent: [
    body("pageSlug").notEmpty().withMessage("Page slug is required"),
    body("eventName").notEmpty().withMessage("Event name is required"),
    body("sessionId").optional().isString(),
    body("visitorId").optional().isString(),
    body("eventData").optional().isObject(),
    checkValidationResult,
  ],

  // New: Page slug param validation
  pageSlug: [
    param("pageSlug").notEmpty().withMessage("Page slug is required"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid start date format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid end date format"),
    checkValidationResult,
  ],
};
