import { prisma } from "../config/db";
// import { Resume } from '../../prisma/generated/browser';
import { extractPDFText } from "../utils/pdfParser";

export const createFileDB = async (existingfileName: string, existingfilePath: string) => {
  try {
    // issue with prisma db create , 
    const resume = await prisma.resume.create({ 
      data: { fileName: existingfileName, filePath: existingfilePath },
    });
    // const filepathPdf = await getFilePathFromDB(resume.id);
    // const extractedData = await extractPDFText(resume.filePath);
    //  function call for analyze pdf
    // console.log("Extracted data from pdf", extractedData);
    
    return {resume: resume};
  } catch (error) {
    
        console.error("upload resume service error ", error);
        return {
            message: "upload resume service error",
        }
  }
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

