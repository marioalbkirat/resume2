import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { captureResumePreview } from "@/lib/resume/screenshot";
import { NextRequest, NextResponse } from "next/server";

const DEMO_USER_ID = "cmqzvcgn80000t9x89yni4fg9";

const parseJsonField = (formData: FormData, key: string) => {
    const value = formData.get(key);
    if (typeof value !== "string" || !value) return undefined;
    return JSON.parse(value);
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const draftId = formData.get("draftId") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as "ATS" | "REGULAR";
        const requestedVisibility = formData.get("visibility") as "PRIVATE" | "COMMUNITY";
        const targetRoles = JSON.parse((formData.get("targetRoles") as string) || "[]") as string[];
        const previewImage = formData.get("previewImage") as File | null;

        if (!draftId || !name || !description) return NextResponse.json({ error: "draftId, name and description are required" }, { status: 400 });
        let draft = await prisma.resumeDraft.findFirst({ where: { id: draftId, userId: DEMO_USER_ID } });
        if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

        const currentContent = parseJsonField(formData, "content");
        const currentSchema = parseJsonField(formData, "schema");
        const currentSettings = parseJsonField(formData, "settings");
        const currentDistribution = parseJsonField(formData, "distribution");
        const currentStyle = parseJsonField(formData, "style");
        if (currentContent || currentSchema || currentSettings || currentDistribution || currentStyle) {
            draft = await prisma.resumeDraft.update({
                where: { id: draft.id },
                data: {
                    ...(currentContent ? { content: currentContent } : {}),
                    ...(currentSchema ? { schema: currentSchema } : {}),
                    ...(currentSettings ? { settings: currentSettings } : {}),
                    ...(currentDistribution ? { distribution: currentDistribution } : {}),
                    ...(currentStyle ? { style: currentStyle } : {}),
                },
            });
        }

        let previewImagePath = "";
        if (previewImage && previewImage.size > 0) {
            const uploadDir = path.join(process.cwd(), "public", "user-resumes");
            await mkdir(uploadDir, { recursive: true });
            const filename = `${Date.now()}-${previewImage.name}`;
            await writeFile(path.join(uploadDir, filename), Buffer.from(await previewImage.arrayBuffer()));
            previewImagePath = `/user-resumes/${filename}`;
        }

        let template = await prisma.resumeTemplate.create({
            data: {
                name,
                description,
                visibility: "PRIVATE",
                communityRequested: requestedVisibility === "COMMUNITY",
                category: category === "ATS" ? "ATS" : "REGULAR",
                targetRoles,
                previewImage: previewImagePath,
                settings: draft.settings,
                distribution: draft.distribution,
                style: draft.style,
                content: draft.content,
                authorId: DEMO_USER_ID,
            },
        });
        if (!previewImagePath) {
            try {
                const capturedPreviewImage = await captureResumePreview(`${request.nextUrl.origin}/resume/preview/${draft.id}`, `draft-${draft.id}`);
                draft = await prisma.resumeDraft.update({ where: { id: draft.id }, data: { previewImage: capturedPreviewImage } });
                template = await prisma.resumeTemplate.update({ where: { id: template.id }, data: { previewImage: capturedPreviewImage } });
            } catch (previewError) {
                console.error("Failed to capture template preview:", previewError);
            }
        }
        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create template from draft", details: error }, { status: 400 });
    }
}
