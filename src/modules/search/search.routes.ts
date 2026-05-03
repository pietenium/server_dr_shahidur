import { Router } from "express";
import { searchController } from "./search.controller";
import { searchValidator } from "./search.validator";
import { searchLimiter } from "@middlewares/rate-limiter.middleware";

const router = Router();

// Public search route
router.get(
  "/",
  searchLimiter,
  searchValidator.query,
  searchController.universalSearch,
);

export default router;
