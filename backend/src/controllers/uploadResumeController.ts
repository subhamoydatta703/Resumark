import type { Response } from "express";
import { createFileDB } from "../services/uploadResumeService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const uploadResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    const existFileName = req.file?.filename;
    const originalName = req.file?.originalname;
    const relativePath = `uploads/${req.file?.filename}`
    
    // Extract authenticated user ID from request
    const userId = req.userId!;
    
    const fileData = await createFileDB(existFileName, relativePath, originalName, userId);

    console.log("fileData from uploadResume controller", JSON.stringify(fileData, null, 2));

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      fileData,
    });
  } catch (error) {
    console.error("upload resume controller error ", error);
    return res.status(500).json({
      success: false,
      message: "upload resume controller error",
    });
  }
};
