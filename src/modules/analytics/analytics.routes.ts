import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { analyticsValidator } from "./analytics.validator";
import { analyticsLimiter } from "@middlewares/rate-limiter.middleware";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";

const router = Router();

// Public route to track page views with rate limiting (60/min)
router.post(
  // for Public Web APP not for this Admin Panel
  "/track",
  analyticsLimiter,
  analyticsValidator.track,
  logActivity("analytics"),
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

// New: Get specific page statistics (admin only)
router.get(
  "/pages/:pageSlug",
  analyticsLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  analyticsValidator.pageSlug,
  analyticsController.getSpecificPageStats,
);

export default router;
