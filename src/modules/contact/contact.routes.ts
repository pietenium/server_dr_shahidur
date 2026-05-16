import { ROLES } from "@constants/roles.constant";
import { logActivity } from "@middlewares/activity-log.middleware";
import { authenticate } from "@middlewares/auth.middleware";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { verifyRecaptcha } from "@middlewares/recaptcha.middleware";
import { authorize } from "@middlewares/role.middleware";
import { Router } from "express";
import { contactController } from "./contact.controller";
import { contactValidator } from "./contact.validator";

const router = Router();

// Public route to submit contact form
router.post(
  "/",
  globalLimiter,
  verifyRecaptcha,
  contactValidator.create,
  contactController.create,
);

// Admin routes
router.use(
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
);

router.get("/", contactValidator.query, contactController.getMessages);

router.get("/:id", contactController.getMessageById);

router.patch("/:id/read", contactController.markAsRead);

router.delete("/:id", logActivity("contact"), contactController.delete);

export default router;
