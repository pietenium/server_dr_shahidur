import { body } from "express-validator";

export const appointmentValidator = {
  create: [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("preferredDate").isISO8601().withMessage("Invalid date"),
    body("preferredTime").notEmpty().withMessage("Time is required"),
  ],
};
