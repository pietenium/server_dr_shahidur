import { ROLES } from "@constants/roles.constant";
import { logActivity } from "@middlewares/activity-log.middleware";
import { authenticate } from "@middlewares/auth.middleware";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { authorize } from "@middlewares/role.middleware";
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { appInfoController } from "./app-info.controller";
import { updateAppInfoValidator } from "./app-info.validator";

const router = Router();

// Multer for doctorImage and ogImage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).fields([
  { name: "doctorImage", maxCount: 1 },
  { name: "ogImage", maxCount: 1 },
]);

// Multer wrapper middleware
const handleUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  upload(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

// Public route
router.get("/", globalLimiter, appInfoController.getAppInfo);

// Protected route
router.patch(
  "/",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  handleUpload,
  updateAppInfoValidator,
  logActivity("app-info"),
  appInfoController.updateAppInfo,
);

export default router;
