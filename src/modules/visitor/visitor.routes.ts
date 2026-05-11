import { Router } from "express";
import { visitorController } from "./visitor.controller";

const router = Router();

// GET - Check if visitor has cookies set (for popup logic)
router.get("/status", visitorController.getCookieStatus);

// POST - Accept cookies and generate visitor IDs
router.post("/accept", visitorController.acceptCookies);

// POST - Decline cookies
router.post("/decline", visitorController.declineCookies);

export default router;
