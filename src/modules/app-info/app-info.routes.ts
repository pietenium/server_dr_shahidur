import { Router } from "express";
import { appInfoController } from "./app-info.controller";
import { appInfoValidator } from "./app-info.validator";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { ROLES } from "@constants/roles.constant";

const router = Router();

router.get("/", globalLimiter, appInfoController.get);

router.patch(
  "/",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN),
  appInfoValidator.update,
  logActivity("app-info"),
  appInfoController.update,
);

export default router;
