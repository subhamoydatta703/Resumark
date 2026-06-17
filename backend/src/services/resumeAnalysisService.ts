
import { prisma } from "../config/db";
import { getFilePathFromDB } from "../services/uploadResumeService";
import { extractPDFText } from "../utils/pdfParser";
import { analyzeWithGemini } from "./geminiService";
import { redisClient } from "../config/redis.caching";
export const analyzeThisResume = async (thisFileID: string) => {
    
    try {
        const filePath: string | null = await getFilePathFromDB(thisFileID);
        if (!filePath) {
            throw new Error('File not found');
        }
        const resume = await prisma.resume.findUnique({
            where: { id: thisFileID },
            // select: { status: true, analysisResult: true }
        });
        if (resume && resume.status === "COMPLETED" && resume.analysisResult) {
            return typeof resume.analysisResult === "string"
                ? resume.analysisResult
                : JSON.stringify(resume.analysisResult);
        }
        const extractedData = await extractPDFText(filePath);
        const analyzedData = await analyzeWithGemini(extractedData);
        
        let cleanText = analyzedData.trim();
        // Remove markdown codeblock indicators if present
        if (cleanText.startsWith("```json")) {
            cleanText = cleanText.substring(7);
        }
        if (cleanText.endsWith("```")) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        const parsedAnalysis = JSON.parse(cleanText);
        const updatedResume = await prisma.resume.update({
            where: {
                id: thisFileID,
            },
            data: {
                status: "COMPLETED",
                analysisResult: parsedAnalysis,
            },
            select: {
                userId: true,
            },
        });
        const cacheKey = `user:${updatedResume.userId}:resume:${thisFileID}`;
        await redisClient.del(cacheKey);

        return analyzedData;

    } catch (error) {
        console.log("Error in analyzeThisResume function: ", error);

        try {
            const updatedResume = await prisma.resume.update({
                where: { id: thisFileID },
                data: {
                    status: "FAILED",
                },
                select: {
                    userId: true,
                },
            });
            const cacheKey = `user:${updatedResume.userId}:resume:${thisFileID}`;
            await redisClient.del(cacheKey);
        } catch (dbErr) {
            console.error("Failed to update status to FAILED in DB:", dbErr);
        }
        throw error;
    }
}



