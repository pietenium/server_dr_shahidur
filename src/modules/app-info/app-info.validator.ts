import { body, type ValidationChain } from "express-validator";

export const updateAppInfoValidator: ValidationChain[] = [
  body("siteName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Site name must be between 2 and 200 characters"),
  body("siteDescription")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Site description cannot exceed 500 characters"),
  body("doctorName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Doctor name must be between 2 and 100 characters"),
  body("doctorTitle")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Doctor title must be between 2 and 200 characters"),
  body("doctorSpecialty")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Specialty must be between 2 and 200 characters"),
  body("doctorBio")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Bio cannot exceed 5000 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("phone")
    .optional()
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("Phone must be between 5 and 20 characters"),
  body("address")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address cannot exceed 500 characters"),
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
  body("clinicHours")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Clinic hours cannot exceed 1000 characters"),
  body("mapEmbedUrl")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Map embed URL cannot exceed 500 characters"),
];
