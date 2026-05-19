import { ROLES } from "@constants/roles.constant";
import { logActivity } from "@middlewares/activity-log.middleware";
import { authenticate } from "@middlewares/auth.middleware";
import {
  appointmentLimiter,
  globalLimiter,
} from "@middlewares/rate-limiter.middleware";
import { verifyRecaptcha } from "@middlewares/recaptcha.middleware";
import { authorize } from "@middlewares/role.middleware";
import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import { appointmentValidator } from "./appointment.validator";

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

router.delete(
  "/bulk",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  appointmentValidator.bulkDelete,
  logActivity("appointment"),
  appointmentController.bulkDelete,
);

router.delete(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  appointmentValidator.validateId,
  logActivity("appointment"),
  appointmentController.deleteById,
);

export default router;
