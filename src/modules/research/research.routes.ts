import { ROLES } from "@constants/roles.constant";
import { logActivity } from "@middlewares/activity-log.middleware";
import {
  authenticate,
  optionalAuthenticate,
} from "@middlewares/auth.middleware";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { authorize } from "@middlewares/role.middleware";
import { uploadImage, uploadPDF } from "@middlewares/upload.middleware";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { researchController } from "./research.controller";
import { researchValidator } from "./research.validator";

const router = Router();

// Custom middleware for handling research file uploads
const handleResearchFiles = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Create promises for both uploads
  const uploadPromises: Promise<void>[] = [];

  // Handle PDF upload if present
  const uploadType = (req.body as { uploadType?: string }).uploadType;
  if (uploadType === "PDF" || req.method === "PATCH") {
    const pdfPromise = new Promise<void>((resolve, reject) => {
      uploadPDF.single("pdfFile")(req, res, (err) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        } else {
          resolve();
        }
      });
    });
    uploadPromises.push(pdfPromise);
  }

  // Handle thumbnail upload if present
  const imagePromise = new Promise<void>((resolve, reject) => {
    uploadImage.single("thumbnailImage")(req, res, (err) => {
      if (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      } else {
        resolve();
      }
    });
  });
  uploadPromises.push(imagePromise);

  // Wait for all uploads to complete
  Promise.all(uploadPromises)
    .then(() => next())
    .catch((err) => next(err));
};

// Public routes
router.get(
  "/",
  globalLimiter,
  optionalAuthenticate,
  researchValidator.query,
  researchController.getResearchList,
);

router.get(
  "/:slug",
  globalLimiter,
  optionalAuthenticate,
  researchController.getBySlug,
);

// Admin routes
router.get(
  "/admin",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  researchValidator.query,
  logActivity("research"),
  researchController.getResearchList,
);

router.post(
  "/",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  handleResearchFiles,
  researchValidator.create,
  logActivity("research"),
  researchController.create,
);

router.patch(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  handleResearchFiles,
  researchValidator.update,
  logActivity("research"),
  researchController.update,
);

router.delete(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  researchValidator.validateId,
  logActivity("research"),
  researchController.delete,
);

export default router;
