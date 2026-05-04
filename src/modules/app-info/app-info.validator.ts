import { body } from "express-validator";
import { checkValidationResult } from "@utils/validation";

export const appInfoValidator = {
  update: [
    body("siteName").optional().isString().trim().notEmpty(),
    body("siteDescription").optional().isString().trim(),
    body("doctorName").optional().isString().trim().notEmpty(),
    body("doctorTitle").optional().isString().trim().notEmpty(),
    body("doctorSpecialty").optional().isString().trim().notEmpty(),
    body("doctorBio").optional().isString().trim(),
    
    body("email").optional().isEmail().withMessage("Invalid email address"),
    body("phone").optional().isString().trim().notEmpty(),
    body("address").optional().isString().trim(),
    
    body("socialLinks").optional().isObject(),
    body("socialLinks.facebook").optional().isURL().withMessage("Invalid Facebook URL"),
    body("socialLinks.twitter").optional().isURL().withMessage("Invalid Twitter URL"),
    body("socialLinks.linkedin").optional().isURL().withMessage("Invalid LinkedIn URL"),
    body("socialLinks.youtube").optional().isURL().withMessage("Invalid YouTube URL"),
    body("socialLinks.instagram").optional().isURL().withMessage("Invalid Instagram URL"),
    
    body("clinicHours").optional().isString().trim(),
    body("mapEmbedUrl").optional().isURL().withMessage("Invalid map embed URL"),
    
    body("doctorImage").optional().isObject(),
    body("doctorImage.url").optional().isString(),
    body("doctorImage.fileId").optional().isString(),
    
    body("ogImage").optional().isObject(),
    body("ogImage.url").optional().isString(),
    body("ogImage.fileId").optional().isString(),
    
    checkValidationResult,
  ],
};
