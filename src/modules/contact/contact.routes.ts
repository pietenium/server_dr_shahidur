import { Router } from "express";
import { contactController } from "./contact.controller";
import { contactValidator } from "./contact.validator";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

// Public route to submit contact form
router.post(
  "/",
  globalLimiter,
  contactValidator.create,
  contactController.create,
);

// Admin routes
router.use(globalLimiter, authenticate, authorize(ROLES.ADMIN, ROLES.MODERATOR));

router.get("/", contactValidator.query, contactController.getMessages);

router.get("/:id", contactController.getMessageById);

router.patch("/:id/read", logActivity("contact"), contactController.markAsRead);

router.delete("/:id", logActivity("contact"), contactController.delete);

export default router;
