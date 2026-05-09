import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { articleController } from "./article.controller";
import { articleValidator } from "./article.validator";
import {
  authenticate,
  optionalAuthenticate,
} from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";
import { uploadImage } from "@middlewares/upload.middleware";

const router = Router();

// Custom middleware for handling article file uploads (featuredImage and ogImage)
const handleArticleFiles = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Use uploadImage for both images (both are images)
  const upload = uploadImage.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "ogImage", maxCount: 1 },
  ]);

  upload(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

// --- Category Routes ---
router.get("/categories", globalLimiter, articleController.getCategories);

router.post(
  "/categories",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.createCategory,
  logActivity("article-category"),
  articleController.createCategory,
);

router.patch(
  "/categories/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.updateCategory,
  logActivity("article-category"),
  articleController.updateCategory,
);

router.delete(
  "/categories/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.validateId,
  logActivity("article-category"),
  articleController.deleteCategory,
);

// --- Article Routes ---

// Public listing and detail
router.get(
  "/",
  globalLimiter,
  optionalAuthenticate,
  articleValidator.query,
  articleController.getArticles,
);

router.get(
  "/slug/:slug",
  globalLimiter,
  optionalAuthenticate,
  articleController.getBySlug,
);

// Admin routes
router.get(
  "/admin",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.query,
  articleController.getArticles,
);

router.post(
  "/",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  handleArticleFiles,
  articleValidator.create,
  logActivity("article"),
  articleController.create,
);

router.patch(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  handleArticleFiles,
  articleValidator.update,
  logActivity("article"),
  articleController.update,
);

router.delete(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.validateId,
  logActivity("article"),
  articleController.delete,
);

export default router;
