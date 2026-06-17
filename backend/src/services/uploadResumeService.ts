import { prisma } from "../config/db";
// import { Resume } from '../../prisma/generated/browser';
import { extractPDFText } from "../utils/pdfParser";

export const createFileDB = async (
  existingfileName: string, 
  existingfilePath: string, 
  originalName: string,
  userId: string
) => {
  // Check for duplicates based on originalName AND userId
  const existingResume = await prisma.resume.findFirst({
    where: { 
      originalName: originalName,
      userId: userId,
    },
  });
  console.log("Checking duplicate in DB: ", existingResume);
  
  if (existingResume) {
    return { resume: existingResume };
  }
  
  const resume = await prisma.resume.create({ 
    data: { 
      fileName: existingfileName, 
      filePath: existingfilePath, 
      originalName: originalName,
      userId: userId,
    },
  });
  
  return { resume };
};

export const updateResumeService = async (resumeID: string, userId: string, data: any) => {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeID },
    select: { userId: true },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (resume.userId !== userId) {
    throw new Error("Unauthorized: You do not own this resume");
  }

  return await prisma.resume.update({
    where: { id: resumeID },
    data,
  });
};

export const deleteResumeService = async (resumeID: string, userId: string) => {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeID },
    select: { userId: true },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (resume.userId !== userId) {
    throw new Error("Unauthorized: You do not own this resume");
  }

  return await prisma.resume.delete({
    where: { id: resumeID },
  });
};



export const getFilePathFromDB = async ( fileID: string ) => {
    try {
      const file = await prisma.resume.findUnique({
          where: { id: fileID },
          select: { filePath: true },
      });
      if (!file) {
        throw new Error("File not found");
      }
      return file.filePath;
    } catch (error) {
      console.error("Error while get file path from DB in service", error);
      throw error;
    }
}

