import { Router } from "express";
import { analyzeResume } from "../controllers/analyzeResumeController";

const router = Router();


router.post("/:id", analyzeResume);

export default router;
