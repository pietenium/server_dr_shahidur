import { body } from "express-validator";

export const authValidator = {
  login: [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};
