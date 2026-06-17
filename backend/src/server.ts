import "dotenv/config";
import app from "./app";
import { connectRedis } from "./config/redis.caching";
import { log } from "node:console";

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await connectRedis();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Redis Connection Failed:", error);
    process.exit(1);
  }
}

startServer();

