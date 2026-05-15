import { searchLimiter } from "@middlewares/rate-limiter.middleware";
import { Router } from "express";
import { searchController } from "./search.controller";
import { searchValidator } from "./search.validator";

const router = Router();

// Public search route
router.get(
  "/",
  searchLimiter,
  searchValidator.query,
  searchController.universalSearch,
);

export default router;
