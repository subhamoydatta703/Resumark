import type { Request, Response } from "express";
import { createFileDB } from "../services/uploadResumeServive";
export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    const existFileName = req.file?.filename;
    const relativePath = `uploads/${req.file?.filename}`
    const fileData = await createFileDB(existFileName, relativePath);

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
