import { Router } from "express";
import { usersController } from "./users.controller";
import { usersValidator } from "./users.validator";
import { authenticate as authMiddleware } from "@middlewares/auth.middleware";
import { authorize as roleMiddleware } from "@middlewares/role.middleware";
import { logActivity as activityLogMiddleware } from "@middlewares/activity-log.middleware";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { ROLES } from "@constants/roles.constant";

const router = Router();

// --- Protected Routes (All Auth Users) ---
router.use(globalLimiter);
router.use(authMiddleware);

router.get("/me", usersController.getMe);
router.patch(
  "/me",
  usersValidator.updateProfile,
  activityLogMiddleware("User"),
  usersController.updateMe,
);
router.patch(
  "/me/password",
  usersValidator.changePassword,
  activityLogMiddleware("User"),
  usersController.changePassword,
);

// --- Admin Only Routes ---
router.use(roleMiddleware(ROLES.ADMIN));

router.get("/", usersValidator.getAllUsers, usersController.getAllUsers);
router.post(
  "/invite",
  usersValidator.inviteModerator,
  activityLogMiddleware("User"),
  usersController.inviteModerator,
);
router.patch(
  "/:id/toggle-active",
  usersValidator.validateId,
  activityLogMiddleware("User"),
  usersController.toggleUserActive,
);
router.delete(
  "/:id",
  usersValidator.validateId,
  activityLogMiddleware("User"),
  usersController.deleteUser,
);

export default router;
