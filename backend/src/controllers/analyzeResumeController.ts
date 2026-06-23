import type { Response } from "express";
import { ResumeAnalysisQueue } from "../queues/resume.queue";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/db";

export const analyzeResume = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const fileID: string = typeof req.params.id === 'string' ? req.params.id : '';
        if (!fileID) {
            throw new Error('Invalid or missing file ID');
        }

        const userId = req.userId!;

        // Verify ownership in DB
        const resume = await prisma.resume.findUnique({
            where: { id: fileID },
            select: { userId: true },
        });


        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found",
            });
        }

        if (resume.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You do not own this resume",
            });
        }

        await ResumeAnalysisQueue.add(
            "resume-analysis",
            {
                fileID,
            },
            {
                jobId: fileID,
            }
        );

        console.log("Job added successfully:", fileID);

        const counts = await ResumeAnalysisQueue.getJobCounts();
        console.log("QUEUE COUNTS:", counts);

        return res.status(202).json({
            message: "Analysis started",
        });
    }
    catch (error) {
        console.error("analyze resume controller error ", error);
        return res.status(500).json({
            success: false,
            message: "analyze resume controller error",
        });
    }
};
