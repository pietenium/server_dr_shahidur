import { Router } from "express";
import { testimonialController } from "./testimonial.controller";
import { testimonialValidator } from "./testimonial.validator";
import {
  authenticate,
  optionalAuthenticate,
} from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { uploadImage, uploadVideo } from "@middlewares/upload.middleware";

const router = Router();

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
  uploadImage.single("image"), // Handle image upload
  uploadVideo.single("video"), // Handle video upload
  testimonialValidator.create,
  logActivity("testimonial"),
  testimonialController.create,
);

router.patch(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  uploadImage.single("image"),
  uploadVideo.single("video"),
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
