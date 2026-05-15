import { logActivity } from "@middlewares/activity-log.middleware";
import { authenticate } from "@middlewares/auth.middleware";
import { authLimiter } from "@middlewares/rate-limiter.middleware";
import { Router } from "express";
import { authController } from "./auth.controller";
import { authValidator } from "./auth.validator";

const router = Router();

router.post("/login", authLimiter, authValidator.login, authController.login);

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
  authController.magicLogin,
);

router.post(
  "/reset-password",
  authLimiter,
  authValidator.resetPassword,
  authController.resetPassword,
);

router.post("/refresh-token", authLimiter, authController.refreshToken);

router.post(
  "/logout",
  authLimiter,
  authenticate,
  logActivity("auth"),
  authController.logout,
);

export default router;
