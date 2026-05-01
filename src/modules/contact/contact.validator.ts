import { body } from "express-validator";

export const contactValidator = {
  create: [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("subject").notEmpty().withMessage("Subject is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("reason").isIn(["medical-inquiry", "general", "media", "other"]).withMessage("Invalid reason"),
  ],
};
