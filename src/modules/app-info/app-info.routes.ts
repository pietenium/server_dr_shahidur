import { Router } from "express";
import { appInfoController } from "./app-info.controller";

const router = Router();

router.get("/", appInfoController.get);
router.put("/", appInfoController.update);

export default router;
