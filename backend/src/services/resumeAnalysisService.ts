
import { workerPrisma } from "../config/workerDB";
import { extractPDFText } from "../utils/pdfParser";
import { redisClient } from "../config/redis.caching";
import { getFile } from "./storage/s3StorageService";
import { analyzeResumeWithGuardrails } from "../guardrail/guardrailService";

export const analyzeThisResume = async (thisFileID: string, jobVersion: number) => {

    try {
        const resume = await workerPrisma.resume.findUnique({
            where: { id: thisFileID },
            select: { status: true, analysisResult: true, s3Key: true, userId: true }
        });

        if (!resume) {
            throw new Error('File not found');
        }

        if (resume.status === "COMPLETED" && resume.analysisResult) {
            return typeof resume.analysisResult === "string"
                ? resume.analysisResult
                : JSON.stringify(resume.analysisResult);
        }

        const fileBuffer = await getFile(resume.s3Key);
        const extractedData = await extractPDFText(fileBuffer);
        const validatedAnalysis = await analyzeResumeWithGuardrails(extractedData);

        const updatedResume = await workerPrisma.resume.updateMany({
            where: {
                id: thisFileID,
                version: jobVersion
            },
            data: {
                status: "COMPLETED",
                analysisResult: validatedAnalysis,
            }
        });

        if (updatedResume.count === 0) {
            console.log("File was re-uploaded! Discarding old result.");
            return;
        }

        const cacheKey = `user:${resume.userId}:resume:${thisFileID}`;
        await redisClient.del(cacheKey);

        return JSON.stringify(validatedAnalysis);

    } catch (error) {
        console.log("Error in analyzeThisResume function: ", error);

        try {
            const updatedResume = await workerPrisma.resume.update({
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



