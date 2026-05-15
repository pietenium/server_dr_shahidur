import { ROLES } from "@constants/roles.constant";
import { logActivity } from "@middlewares/activity-log.middleware";
import { authenticate } from "@middlewares/auth.middleware";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { authorize } from "@middlewares/role.middleware";
import {
  uploadImage,
  uploadPDF,
  uploadVideo,
} from "@middlewares/upload.middleware";
import { Router } from "express";
import { uploadController } from "./upload.controller";

const router = Router();

// Require authentication and authorization for all uploads
router.use(
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
);

router.post(
  "/image",
  uploadImage.single("file"),
  logActivity("upload"),
  uploadController.uploadImage,
);
router.post(
  "/pdf",
  uploadPDF.single("file"),
  logActivity("upload"),
  uploadController.uploadPdf,
);
router.post(
  "/video",
  uploadVideo.single("file"),
  logActivity("upload"),
  uploadController.uploadVideo,
);

export default router;
