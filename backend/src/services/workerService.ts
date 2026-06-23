import { Worker } from "bullmq";
import { bullRedisConnection } from "../config/redis.bullmq";
import { analyzeThisResume } from "./resumeAnalysisService";
import { workerPrisma } from "../config/workerDB";

let worker: Worker;

export async function startWorker() {
  console.log("BullMQ Worker starting...");

  worker = new Worker(
    "resume-analysis",
    async (job) => {
      const { fileID } = job.data;

      console.log(`Processing job ${job.id} for file ${fileID}`);
      console.log("Worker processor function started");

      if (!fileID) {
        throw new Error("Invalid or missing file ID");
      }

      console.log("About to update status to PROCESSING");

      await workerPrisma.resume.update({
        where: { id: fileID },
        data: { status: "PROCESSING" },
      });

      console.log("PROCESSING status updated");

      await analyzeThisResume(fileID);

      console.log("analyzeThisResume completed");
    },
    {
      connection: bullRedisConnection,
    }
  );

  console.log("Worker object created");

  worker.on("ready", () => {
    console.log("WORKER READY");
  });

  worker.on("active", (job) => {
    console.log("ACTIVE JOB:", job.id);
  });

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on("failed", async (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);

    if (job?.data?.fileID) {
      try {
        await workerPrisma.resume.update({
          where: { id: job.data.fileID },
          data: { status: "FAILED" },
        });

        console.log("Updated status to FAILED");
      } catch (updateError) {
        console.error("Failed to update FAILED status:", updateError);
      }
    }
  });

  worker.on("error", (err) => {
    console.error("Worker runtime error:", err);
  });

  worker.on("closing", () => {
    console.log("WORKER CLOSING");
  });

  worker.on("closed", () => {
    console.log("WORKER CLOSED");
  });

  console.log("BullMQ Worker started successfully");
}