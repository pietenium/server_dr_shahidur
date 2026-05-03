import { Router } from "express";
import { testimonialController } from "./testimonial.controller";
import { testimonialValidator } from "./testimonial.validator";
import { authenticate, optionalAuthenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

// Public routes
router.get("/", globalLimiter, optionalAuthenticate, testimonialController.getAll);

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
  testimonialValidator.create,
  logActivity("testimonial"),
  testimonialController.create,
);

router.patch(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
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
