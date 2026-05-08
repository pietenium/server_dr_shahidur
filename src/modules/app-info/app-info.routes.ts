import { Router } from "express";
import { appInfoController } from "./app-info.controller";
import { updateAppInfoValidator } from "./app-info.validator";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

// Public route to get site information
router.get("/", globalLimiter, appInfoController.getAppInfo);

// Protected route to update site information
router.patch(
  "/",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  updateAppInfoValidator,
  logActivity("app-info"),
  appInfoController.updateAppInfo,
);

export default router;
