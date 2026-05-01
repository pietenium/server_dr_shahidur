import { query } from "express-validator";

export const searchValidator = {
  search: [
    query("q").notEmpty().withMessage("Search query is required"),
  ],
};
