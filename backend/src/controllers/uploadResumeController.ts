import type { Request, Response } from "express";
import { createFileDB } from "../services/uploadResumeServive";
export const uploadResume = async (req: Request, res: Response) => {
  try {
    const existFileName = req.file?.filename;
    const existFilePath = req.file?.path;
    if (!existFileName || !existFilePath) {
      return res.status(404).json({
        success: false,
        message: "File name or file path is undefined",
      });
    }
    const fileData = await createFileDB(existFileName, existFilePath);
    
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
