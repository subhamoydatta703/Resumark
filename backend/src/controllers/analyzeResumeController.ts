import type { Request, Response } from "express";
import { ResumeAnalysisQueue } from "../queues/resume.queue";

export const analyzeResume = async (req: Request, res: Response) => {
    try {
        // const fileData = await FindFileDB(existFileName, relativePath);
        const fileID: string = typeof req.params.id === 'string' ? req.params.id : '';
        if (!fileID) {
            throw new Error('Invalid or missing file ID');
        }

        await ResumeAnalysisQueue.add(
            "resume-analysis",
            {
                fileID,
            }
        );

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
