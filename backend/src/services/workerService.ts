import { Worker } from "bullmq";
import { bullRedisConnection, verifyBullMQConnection } from "../config/redis.bullmq";
import { analyzeThisResume } from "./resumeAnalysisService";
import { workerPrisma } from "../config/workerDB";
import { connectRedis } from "../config/redis.caching";

async function startWorker() {
    console.log("Worker process starting...");
    
    // Health checks
    await connectRedis();
    await verifyBullMQConnection();
    
    console.log("Redis connections verified. Starting BullMQ Worker...");

const worker = new Worker("resume-analysis", async (job) => {
    try {
        console.log("Job data comes from worker service: ", JSON.stringify(job.data, null, 2));
        const { fileID } = job.data;
        if (!fileID) {
            throw new Error("Invalid or missing file ID");
        }

        await workerPrisma.resume.update({
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
        await workerPrisma.resume.update({
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

}

startWorker();