import { Router } from "express";
import { authController } from "./auth.controller";
import { authValidator } from "./auth.validator";
import { authenticate } from "@middlewares/auth.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { authLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

router.post(
  "/login",
  authLimiter,
  authValidator.login,
  logActivity("auth"),
  authController.login,
);

router.post(
  "/forgot-password",
  authLimiter,
  authValidator.forgotPassword,
  authController.forgotPassword,
);

router.post(
  "/verify-otp",
  authLimiter,
  authValidator.verifyOtp,
  authController.verifyOtp,
);

router.post(
  "/magic-login",
  authLimiter,
  authValidator.magicLogin,
  logActivity("auth"),
  authController.magicLogin,
);

router.post(
  "/reset-password",
  authLimiter,
  authValidator.resetPassword,
  logActivity("auth"),
  authController.resetPassword,
);

router.post(
  "/refresh-token",
  authController.refreshToken,
);

router.post(
  "/logout",
  authenticate,
  logActivity("auth"),
  authController.logout,
);

export default router;
