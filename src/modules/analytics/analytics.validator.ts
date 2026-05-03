import { body } from "express-validator";
import { checkValidationResult } from "@utils/validation";

export const analyticsValidator = {
  track: [
    body("page").notEmpty().withMessage("Page is required"),
    body("sessionId").notEmpty().withMessage("Session ID is required"),
    body("visitorId").optional().isString(),
    body("referrer").optional().isString(),
    checkValidationResult,
  ],
};
