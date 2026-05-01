import { Router } from "express";
import { activityLogController } from "./activity-log.controller";

const router = Router();

router.get("/", activityLogController.getLogs);

export default router;
