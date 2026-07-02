-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('OFFICIAL', 'COMMUNITY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SectionTarget" AS ENUM ('RESUME', 'PORTFOLIO');

-- CreateEnum
CREATE TYPE "ResumeCategory" AS ENUM ('ATS', 'REGULAR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL,
    "previewImage" TEXT NOT NULL,
    "category" "ResumeCategory" NOT NULL DEFAULT 'REGULAR',
    "targetRoles" TEXT[],
    "description" VARCHAR(200) NOT NULL,
    "settings" JSONB NOT NULL,
    "distribution" JSONB NOT NULL,
    "style" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateLike" (
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateLike_pkey" PRIMARY KEY ("userId","templateId")
);

-- CreateTable
CREATE TABLE "TemplateSave" (
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateSave_pkey" PRIMARY KEY ("userId","templateId")
);

-- CreateTable
CREATE TABLE "TemplateDownload" (
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateDownload_pkey" PRIMARY KEY ("userId","templateId")
);

-- CreateTable
CREATE TABLE "TemplateFork" (
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateFork_pkey" PRIMARY KEY ("userId","templateId")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" "SectionTarget" NOT NULL,
    "visibility" "Visibility" NOT NULL,
    "authorId" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "distribution" JSONB NOT NULL,
    "style" JSONB NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isDownloaded" BOOLEAN NOT NULL DEFAULT false,
    "isLinkedWithPortfolio" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemplateLike_templateId_idx" ON "TemplateLike"("templateId");

-- CreateIndex
CREATE INDEX "TemplateSave_templateId_idx" ON "TemplateSave"("templateId");

-- CreateIndex
CREATE INDEX "TemplateDownload_templateId_idx" ON "TemplateDownload"("templateId");

-- CreateIndex
CREATE INDEX "TemplateFork_templateId_idx" ON "TemplateFork"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Section_authorId_name_key" ON "Section"("authorId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeDraft_slug_key" ON "ResumeDraft"("slug");

-- CreateIndex
CREATE INDEX "ResumeDraft_userId_idx" ON "ResumeDraft"("userId");

-- CreateIndex
CREATE INDEX "ResumeDraft_templateId_idx" ON "ResumeDraft"("templateId");

-- AddForeignKey
ALTER TABLE "ResumeTemplate" ADD CONSTRAINT "ResumeTemplate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateLike" ADD CONSTRAINT "TemplateLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateLike" ADD CONSTRAINT "TemplateLike_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSave" ADD CONSTRAINT "TemplateSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSave" ADD CONSTRAINT "TemplateSave_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateDownload" ADD CONSTRAINT "TemplateDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateDownload" ADD CONSTRAINT "TemplateDownload_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateFork" ADD CONSTRAINT "TemplateFork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateFork" ADD CONSTRAINT "TemplateFork_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeDraft" ADD CONSTRAINT "ResumeDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeDraft" ADD CONSTRAINT "ResumeDraft_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
