import { createClient } from "redis";

export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || "localhost"}:${
    process.env.REDIS_PORT || "6379"
  }`,
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export async function connectRedis() {
  try {
    await redisClient.connect();
    
    console.log("Redis Connected");
  } catch (error) {
    console.error("Redis Connection Failed:", error);
  }
}