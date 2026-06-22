import "dotenv/config";
import app from "./app";
import { connectRedis } from "./config/redis.caching";
import { verifyBullMQConnection } from "./config/redis.bullmq";
import { log } from "node:console";

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    // Health checks for both Redis instances
    await connectRedis();
    await verifyBullMQConnection();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server Startup Failed:", error);
    process.exit(1);
  }
}

startServer();

