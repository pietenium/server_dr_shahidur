import { body } from "express-validator";

export const appInfoValidator = {
  update: [
    body("siteName").optional().notEmpty().withMessage("Site name cannot be empty"),
    body("email").optional().isEmail().withMessage("Invalid email"),
  ],
};
