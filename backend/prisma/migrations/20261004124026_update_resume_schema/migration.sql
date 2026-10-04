/*
  Warnings:

  - A unique constraint covering the columns `[userId,originalName]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_originalName_key" ON "Resume"("userId", "originalName");
