import { prisma } from "../config/db";
// import { Resume } from '../../prisma/generated/browser';

export const createFileDB = async (existingfileName: string, existingfilePath: string) => {
  try {
    // issue with prisma db create , 
    const resume = await prisma.resume.create({ 
      data: { fileName: existingfileName, filePath: existingfilePath },
    });
    return {resume: resume};
  } catch (error) {
    
        console.error("upload resume service error ", error);
        return {
            message: "upload resume service error",
        }
  }
};
