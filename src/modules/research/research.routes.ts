import { Router } from "express";
import { researchController } from "./research.controller";
import { researchValidator } from "./research.validator";
import { authenticate, optionalAuthenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/role.middleware";
import { logActivity } from "@middlewares/activity-log.middleware";
import { ROLES } from "@constants/roles.constant";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

// Public routes
router.get("/", globalLimiter, optionalAuthenticate, researchValidator.query, researchController.getResearchList);
router.get("/slug/:slug", globalLimiter, optionalAuthenticate, researchValidator.validateSlug, researchController.getBySlug);

// Admin routes
router.get(
  "/admin",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  researchValidator.query,
  logActivity("research"),
  researchController.getResearchList,
);

router.post(
  "/",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  researchValidator.create,
  logActivity("research"),
  researchController.create,
);

router.patch(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  researchValidator.update,
  logActivity("research"),
  researchController.update,
);

router.delete(
  "/:id",
  globalLimiter,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MODERATOR),
  researchValidator.validateId,
  logActivity("research"),
  researchController.delete,
);

export default router;
