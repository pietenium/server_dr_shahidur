import { ROLES } from "@constants/roles.constant";
import { logActivity } from "@middlewares/activity-log.middleware";
import { authenticate } from "@middlewares/auth.middleware";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { authorize } from "@middlewares/role.middleware";
import { Router } from "express";
import { usersController } from "./users.controller";
import { usersValidator } from "./users.validator";

const router = Router();

// --- Protected Routes (All Auth Users) ---
router.use(globalLimiter);
router.use(authenticate);

router.get("/me", usersController.getMe);
router.patch(
  "/me",
  usersValidator.updateProfile,
  logActivity("users"),
  usersController.updateMe,
);
router.patch(
  "/me/password",
  usersValidator.changePassword,
  logActivity("users"),
  usersController.changePassword,
);

// --- Admin Only Routes ---
router.use(authorize(ROLES.ADMIN));

router.get(
  "/",
  usersValidator.getAllUsers,
  usersController.getAllUsers,
);
router.post(
  "/invite",
  usersValidator.inviteModerator,
  logActivity("users"),
  usersController.inviteModerator,
);
router.patch(
  "/:id/toggle-active",
  usersValidator.validateId,
  logActivity("users"),
  usersController.toggleUserActive,
);
router.delete(
  "/:id",
  usersValidator.validateId,
  logActivity("users"),
  usersController.deleteUser,
);

export default router;
