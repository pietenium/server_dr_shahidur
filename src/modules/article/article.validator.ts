import { body } from "express-validator";

export const articleValidator = {
  create: [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category").isMongoId().withMessage("Invalid category ID"),
    body("articleType").isIn(["MEDICAL", "POLITICAL"]).withMessage("Invalid article type"),
  ],
};
