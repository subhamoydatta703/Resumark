import { Router } from "express";
import { analyzeResume } from "../controllers/analyzeResumeController";
import { getResumeController } from "../controllers/getResumeResultController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();


router.post("/:id", authMiddleware, analyzeResume);
router.get("/:id/analyze", authMiddleware, getResumeController)

export default router;
