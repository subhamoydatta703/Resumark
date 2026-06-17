import { Worker } from "bullmq";
import { bullRedisConnection } from "../config/redis.bullmq";
import { analyzeThisResume } from "./resumeAnalysisService";
import { prisma } from "../config/db";
import { connectRedis } from "../config/redis.caching";


console.log("Worker is running.");
connectRedis();

const worker = new Worker("resume-analysis", async (job) => {
    try {
        console.log("Job data comes from worker service: ", JSON.stringify(job.data, null, 2));
        const { fileID } = job.data;
        if (!fileID) {
            throw new Error("Invalid or missing file ID");
        }

        await prisma.resume.update({
            where: {
                id: fileID,
            },
            data: {
                status: "PROCESSING",
            },
        });


        await analyzeThisResume(fileID);


    } catch (error) {
        console.log("Error in worker service: ", error);
        await prisma.resume.update({
            where: { id: job.data.fileID },
            data: {
                status: "FAILED",
            },
        });
        throw error;
    }

}, {
    connection: bullRedisConnection

}

)

worker.on("error", (err) => {
    console.error("Worker connection/runtime error:", err);
});