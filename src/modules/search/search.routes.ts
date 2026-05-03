import { Router } from "express";
import { searchController } from "./search.controller";
import { searchValidator } from "./search.validator";
import { globalLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

// Public search route
router.get(
  "/",
  globalLimiter,
  searchValidator.query,
  searchController.universalSearch,
);

export default router;
