import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { researchController } from "./research.controller";
import { researchValidator } from "./research.validator";
import {
  authenticate,
  optionalAuthenticate,
} from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import multer from "multer";

const router = Router();

// Single multer setup for research: PDF + optional thumbnail
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
  },
}).fields([
  { name: "pdfFile", maxCount: 1 },
  { name: "thumbnailImage", maxCount: 1 },
]);

// Multer wrapper middleware
const handleUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  upload(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
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
  "/slug/:slug",
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

// IMPORTANT: handleUpload runs BEFORE validator so req.body is populated
router.post(
  "/",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  handleUpload,
  researchValidator.create,
  logActivity("research"),
  researchController.create,
);

router.patch(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  handleUpload,
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
