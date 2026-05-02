import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { analyticsValidator } from "./analytics.validator";
import { analyticsLimiter } from "@middlewares/rate-limiter.middleware";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { ROLES } from "@constants/roles.constant";

const router = Router();

// Public route to track page views with rate limiting (60/min)
router.post(
  "/track",
  analyticsLimiter,
  analyticsValidator.track,
  analyticsController.track,
);

// Protected routes for admin/moderator to view stats
router.get(
  "/geo",
  analyticsLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  analyticsController.getGeoStats,
);

router.get(
  "/pages",
  analyticsLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  analyticsController.getPageStats,
);

export default router;
