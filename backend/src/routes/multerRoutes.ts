import { Router } from "express";
import upload from "../middleware/multerMiddleware";
import { uploadResume } from "../controllers/uploadResumeController";

const router = Router();


router.post("/upload", upload.single("resume"), uploadResume);

export default router;
