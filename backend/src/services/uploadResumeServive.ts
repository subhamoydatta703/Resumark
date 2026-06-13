import { prisma } from "../config/db";
// import { Resume } from '../../prisma/generated/browser';

export const createFileDB = async (existingfileName: string) => {
  try {
    const resume = await prisma.resume.create({
      data: { fileName: existingfileName },
    });
    return {resume: resume};
  } catch (error) {
    
        console.error("upload resume service error ", error);
        return {
            message: "upload resume service error",
        }
  }
};
