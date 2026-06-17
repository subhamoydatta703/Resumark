import { prisma } from "../config/db";
import { redisClient } from "../config/redis.caching";


export const getResumeResultService = async (resumeID: string) => {
    // const file = await prisma.resume.findUnique({
    //     where: { id: resumeID },
    //     select: { 
    //         status: true,
    //         analysisResult: true,
    //     },
    // });
    const cacheKey = `resume:${resumeID}`;
    const cachedResume = await redisClient.get(cacheKey);

    if (!cachedResume) {
        const resume = await prisma.resume.findUnique({
            where: {
                id: resumeID,
            },
            select: {
                status: true,
                analysisResult: true,
            },
        });
        if (!resume) {
            throw new Error("Resume not found");
        }
        if (resume.status === "COMPLETED" || resume.status === "FAILED") {
            await redisClient.set(
                cacheKey,
                JSON.stringify(resume),
                {
                    EX: 300,
                }
            );
        }


        console.log("Cache miss");

        return resume;
    }
    console.log("Cache Hit");
    return JSON.parse(cachedResume);

}