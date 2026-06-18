import { PrismaClient } from "../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({
  connectionString: process.env.WORKER_DATABASE_URL!,
});
export const workerPrisma = new PrismaClient({
  adapter,
});




