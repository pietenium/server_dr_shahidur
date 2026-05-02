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
  authenticate,
  globalLimiter,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  testimonialController.getAll,
);

router.get(
  "/:id",
  authenticate,
  globalLimiter,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  testimonialController.getById,
);

router.post(
  "/",
  authenticate,
  globalLimiter,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  testimonialValidator.create,
  logActivity("testimonial"),
  testimonialController.create,
);

router.patch(
  "/:id",
  authenticate,
  globalLimiter,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  testimonialValidator.update,
  logActivity("testimonial"),
  testimonialController.update,
);

router.delete(
  "/:id",
  authenticate,
  globalLimiter,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  logActivity("testimonial"),
  testimonialController.delete,
);

export default router;
