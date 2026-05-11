import { Router } from "express";
import { activityLogController } from "./activity-log.controller";
import { activityLogValidator } from "./activity-log.validator";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

// All activity log routes are admin and moderator only
router.use(
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
);

router.get("/", activityLogValidator.query, activityLogController.getLogs);

router.delete("/clear", activityLogController.clearAll);

router.delete(
  "/bulk",
  activityLogValidator.bulkDelete,
  activityLogController.bulkDelete,
);

router.delete("/:id", activityLogController.deleteById);

export default router;
