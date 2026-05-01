import { body } from "express-validator";

export const analyticsValidator = {
  track: [
    body("page").notEmpty().withMessage("Page is required"),
    body("sessionId").notEmpty().withMessage("Session ID is required"),
  ],
};
