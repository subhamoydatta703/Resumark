import type { Request, Response } from "express";
import { analyzeThisResume } from "../services/resumeanalysisServis";

export const analyzeResume = async (req: Request, res: Response) => {
    try {
        // const fileData = await FindFileDB(existFileName, relativePath);
        const fileID: string = typeof req.params.id === 'string' ? req.params.id : '';
        if (!fileID) {
            throw new Error('Invalid or missing file ID');
        }
        // elkhan theke bakita service a jabe
        const extractedData = await analyzeThisResume(fileID);
        return res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            extractedData,
           
        });
    } catch (error) {
        console.error("analyze resume controller error ", error);
        return res.status(500).json({
            success: false,
            message: "analyze resume controller error",
        });
    }
};
