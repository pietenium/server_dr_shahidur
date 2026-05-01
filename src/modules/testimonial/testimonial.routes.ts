import { Router } from "express";
import { testimonialController } from "./testimonial.controller";

const router = Router();

router.post("/", testimonialController.create);

export default router;
