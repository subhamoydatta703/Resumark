import type { Response } from "express";
import { getResumeResultService } from "../services/getResumeService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const getResumeController = async(req: AuthenticatedRequest, res: Response)=>{
    try {
        if (!req.params.id) {
            throw new Error("Invalid or missing file ID");
        }
        const resumeID = req.params.id as string;
        const userId = req.userId!;
        
        const resumeRes = await getResumeResultService(resumeID, userId);
        console.log("extracteddata comes from get resume controller: ",JSON.stringify(resumeRes, null,2))
        return res.status(200).json({
            success: true,
            message: "Resume analysis result retrieved successfully",
            resumeRes,
        })
    } catch (error: any) {
        console.error("Error in getResumeController function: ", error);
        
        // Return structured error response with status code depending on authorization
        const isUnauthorized = error.message === "Unauthorized: You do not own this resume";
        return res.status(isUnauthorized ? 403 : 500).json({
            success: false,
            message: error.message || "Error in getResumeController function",
        });
    }
}