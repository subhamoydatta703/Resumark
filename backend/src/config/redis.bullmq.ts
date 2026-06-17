import IORedis from "ioredis";

export const bullRedisConnection = new IORedis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
});