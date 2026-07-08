/*
  Warnings:

  - You are about to drop the column `saves` on the `ResumeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `ResumeTemplate` table. All the data in the column will be lost.
  - You are about to drop the `TemplateSave` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TemplateSave" DROP CONSTRAINT "TemplateSave_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateSave" DROP CONSTRAINT "TemplateSave_userId_fkey";

-- AlterTable
ALTER TABLE "ResumeTemplate" DROP COLUMN "saves",
DROP COLUMN "views";

-- DropTable
DROP TABLE "TemplateSave";

-- CreateTable
CREATE TABLE "UserResumeAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitsCount" INTEGER NOT NULL DEFAULT 0,
    "downloadsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserResumeAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserResumeAnalytics_userId_key" ON "UserResumeAnalytics"("userId");

-- CreateIndex
CREATE INDEX "UserResumeAnalytics_userId_idx" ON "UserResumeAnalytics"("userId");

-- AddForeignKey
ALTER TABLE "UserResumeAnalytics" ADD CONSTRAINT "UserResumeAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
