import { body } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";

const checkValidationResult = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.type === "field" ? err.path : undefined,
      message: err.msg as string,
    }));
    return next(
      new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", formattedErrors),
    );
  }
  next();
};

export const appInfoValidator = {
  update: [
    body("siteName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Site name cannot be empty"),
    body("siteDescription").optional().trim(),
    body("doctorName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Doctor name cannot be empty"),
    body("doctorTitle")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Doctor title cannot be empty"),
    body("doctorSpecialty")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Doctor specialty cannot be empty"),
    body("doctorBio").optional().trim(),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("phone")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Phone number cannot be empty"),
    body("address").optional().trim(),
    body("socialLinks").optional().isObject(),
    body("socialLinks.facebook")
      .optional()
      .isURL()
      .withMessage("Invalid Facebook URL"),
    body("socialLinks.twitter")
      .optional()
      .isURL()
      .withMessage("Invalid Twitter URL"),
    body("socialLinks.linkedin")
      .optional()
      .isURL()
      .withMessage("Invalid LinkedIn URL"),
    body("socialLinks.youtube")
      .optional()
      .isURL()
      .withMessage("Invalid YouTube URL"),
    body("socialLinks.instagram")
      .optional()
      .isURL()
      .withMessage("Invalid Instagram URL"),
    body("clinicHours").optional().trim(),
    body("mapEmbedUrl").optional().trim(),
    checkValidationResult,
  ],
};
