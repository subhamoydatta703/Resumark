import { prisma } from "../config/db";
import { redisClient } from "../config/redis.caching";


export const getResumeResultService = async (resumeID: string, userId: string) => {
    const cacheKey = `user:${userId}:resume:${resumeID}`;
    const cachedResume = await redisClient.get(cacheKey);

    if (!cachedResume) {
        const resume = await prisma.resume.findUnique({
            where: {
                id: resumeID,
            },
            select: {
                userId: true,
                status: true,
                analysisResult: true,
            },
        });
        if (!resume) {
            throw new Error("Resume not found");
        }
        if (resume.userId !== userId) {
            throw new Error("Unauthorized: You do not own this resume");
        }
        if (resume.status === "COMPLETED" || resume.status === "FAILED") {
            await redisClient.set(
                cacheKey,
                JSON.stringify({
                    status: resume.status,
                    analysisResult: resume.analysisResult
                }),
                {
                    EX: 300,
                }
            );
        }


        console.log("Cache miss");

        return {
            status: resume.status,
            analysisResult: resume.analysisResult
        };
    }
    console.log("Cache Hit");
    return JSON.parse(cachedResume);

}