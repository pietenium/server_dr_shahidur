import { Router } from "express";
import { chemberController } from "./chembers.controller";
import { chemberValidator } from "./chembers.validator";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

// Public: Get all chambers (for appointment form dropdown)
router.get("/", chemberController.getAll);

// Protected: Admin/Moderator routes
router.use(
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
);

router.get("/:id", chemberValidator.validateId, chemberController.getById);

router.post(
  "/",
  chemberValidator.create,
  logActivity("chembers"),
  chemberController.create,
);

router.patch(
  "/:id",
  chemberValidator.update,
  logActivity("chembers"),
  chemberController.update,
);

router.delete(
  "/:id",
  chemberValidator.validateId,
  logActivity("chembers"),
  chemberController.delete,
);

export default router;
