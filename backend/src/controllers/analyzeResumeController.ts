import type { Response } from "express";
import { ResumeAnalysisQueue } from "../queues/resume.queue";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/db";
import { getResumeForUser } from "../services/getResumeService";
import { version } from "node:os";

export const analyzeResume = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const fileID: string = typeof req.params.id === 'string' ? req.params.id : '';
        if (!fileID) {
            throw new Error('Invalid or missing file ID');
        }

        const userId = req.userId!;

        //Check if user owns the resume
        const resumeResult = await getResumeForUser(fileID, userId)

        if (resumeResult.error === "NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Resume not found",
            });
        }

        
        if (resumeResult.error === "UNAUTHORIZED") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You do not own this resume",
            });
        }

        const {resume} = resumeResult;
    
        // Already resume analysis completed? Return immediately
        if (resume.status === "COMPLETED" && resume.analysisResult) {
            return res.status(200).json({
                success: true,
                message: "Analysis already completed",
                data: resume.analysisResult,
            });
        }

        //Add job to BullMQ Queue
        const job = await ResumeAnalysisQueue.add(
            "resume-analysis",
            {
                fileID,
                version: resume.version,
            },
            {
                jobId:  `${fileID}-v${resume.version}`,
                removeOnComplete:{
                    age: 3600
                },
                removeOnFail:{
                    age: 86400
                }
            }

        );
        console.log(
            "Added job",
            job.id,
            job.name
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
