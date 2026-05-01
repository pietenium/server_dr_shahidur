import { Router } from "express";
import { appointmentController } from "./appointment.controller";

const router = Router();

router.post("/", appointmentController.create);

export default router;
