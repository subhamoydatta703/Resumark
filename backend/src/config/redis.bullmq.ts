import IORedis from "ioredis";

export const bullRedisConnection = process.env.REDIS_JOB_URL
  ? new IORedis(process.env.REDIS_JOB_URL, {
      maxRetriesPerRequest: null,
    })
  : new IORedis({
      host: process.env.REDIS_JOB_HOST || "localhost",
      port: Number(process.env.REDIS_JOB_PORT) || 6379,
      maxRetriesPerRequest: null,
    });