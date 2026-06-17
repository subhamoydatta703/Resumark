import { Queue } from "bullmq";
import { bullRedisConnection } from "../config/redis.bullmq";


export const ResumeAnalysisQueue = new Queue(
    "resume-analysis",
    {
        connection: bullRedisConnection,
    }
);