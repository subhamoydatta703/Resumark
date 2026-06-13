import express from "express";
import cors from "cors";

import { prisma } from "./config/db";

import multerRoutes from "./routes/multerRoutes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/resume", multerRoutes);

// Health Check Route
app.get("/health", async (req, res) => {
  let dbStatus = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error: any) {
    dbStatus = `disconnected: ${error.message || error}`;
  }

  const isHealthy = dbStatus === "connected";

  res.status(isHealthy ? 200 : 500).json({
    status: isHealthy ? "ok" : "error",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
});

export default app;
