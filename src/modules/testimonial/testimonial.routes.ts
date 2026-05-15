import { ROLES } from "@constants/roles.constant";
import { logActivity } from "@middlewares/activity-log.middleware";
import {
  authenticate,
  optionalAuthenticate,
} from "@middlewares/auth.middleware";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { authorize } from "@middlewares/role.middleware";
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { testimonialController } from "./testimonial.controller";
import { testimonialValidator } from "./testimonial.validator";

const router = Router();

// Single multer instance handling both image and video
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max for video
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

// Multer wrapper
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

// Public routes - only show visible testimonials
router.get(
  "/",
  globalLimiter,
  optionalAuthenticate,
  testimonialController.getAll,
);

// Admin routes
router.get(
  "/admin",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  testimonialController.getAll,
);

router.get(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  testimonialValidator.validateId,
  testimonialController.getById,
);

router.post(
  "/",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  handleUpload,
  testimonialValidator.create,
  logActivity("testimonial"),
  testimonialController.create,
);

router.patch(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  handleUpload,
  testimonialValidator.update,
  logActivity("testimonial"),
  testimonialController.update,
);

router.delete(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  testimonialValidator.validateId,
  logActivity("testimonial"),
  testimonialController.delete,
);

export default router;
