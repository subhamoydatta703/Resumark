import { Router } from "express";
import { analyzeResume } from "../controllers/analyzeResumeController";
import { getResumeController } from "../controllers/getResumeResultController";
import { authMiddleware } from "../middleware/authMiddleware";
import { rateLimiter } from "../middleware/rateLimiterMiddleware";

const router = Router();


router.post("/:id", authMiddleware, rateLimiter, analyzeResume);
router.get("/:id", authMiddleware, getResumeController)

export default router;
