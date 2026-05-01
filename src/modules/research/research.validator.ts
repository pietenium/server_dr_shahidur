import { body } from "express-validator";

export const researchValidator = {
  create: [
    body("title").notEmpty().withMessage("Title is required"),
    body("uploadType").isIn(["PDF", "DOI"]).withMessage("Invalid upload type"),
  ],
};
