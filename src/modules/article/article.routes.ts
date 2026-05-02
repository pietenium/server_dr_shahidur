import { Router } from "express";
import { articleController } from "./article.controller";
import { articleValidator } from "./article.validator";
import { authenticate, optionalAuthenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

// --- Category Routes ---
router.get("/categories", articleController.getCategories);

router.post(
  "/categories",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.createCategory,
  logActivity("article-category"),
  articleController.createCategory,
);

router.patch(
  "/categories/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.updateCategory,
  logActivity("article-category"),
  articleController.updateCategory,
);

router.delete(
  "/categories/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  logActivity("article-category"),
  articleController.deleteCategory,
);

// --- Article Routes ---

// Public listing and detail
router.get("/", globalLimiter, optionalAuthenticate, articleValidator.query, articleController.getArticles);
router.get("/slug/:slug", globalLimiter, optionalAuthenticate, articleController.getBySlug);

// Admin routes
router.get(
  "/admin",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.query,
  articleController.getArticles,
);

router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.create,
  logActivity("article"),
  articleController.create,
);

router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  articleValidator.update,
  logActivity("article"),
  articleController.update,
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  logActivity("article"),
  articleController.delete,
);

export default router;
