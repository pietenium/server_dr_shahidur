import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import { appointmentValidator } from "./appointment.validator";
import {
  appointmentLimiter,
  globalLimiter,
} from "@middlewares/rate-limiter.middleware";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { verifyRecaptcha } from "@middlewares/recaptcha.middleware";
import { ROLES } from "@constants/roles.constant";

const router = Router();

// Public: Create appointment
router.post(
  "/",
  appointmentLimiter,
  verifyRecaptcha,
  appointmentValidator.create,
  appointmentController.create,
);

// Protected: Admin/Moderator routes
router.get(
  "/",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  appointmentValidator.query,
  appointmentController.get,
);

router.get(
  "/charts",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  appointmentController.getCharts,
);

router.get(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  appointmentValidator.validateId,
  appointmentController.getById,
);

router.patch(
  "/:id/status",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  appointmentValidator.updateStatus,
  logActivity("appointment"),
  appointmentController.updateStatus,
);

export default router;
