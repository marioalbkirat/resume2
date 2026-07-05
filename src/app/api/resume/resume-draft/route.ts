import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const DEMO_USER_ID = "cmqzvcgn80000t9x89yni4fg9";
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "resume";

export async function GET() {
    try {
        const drafts = await prisma.resumeDraft.findMany({
            where: { userId: DEMO_USER_ID },
            orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        });
        return NextResponse.json(drafts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch drafts", details: error }, { status: 400 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, templateId, content, schema, settings, distribution, style } = body;
        if (!title || !templateId) return NextResponse.json({ error: "title and templateId are required" }, { status: 400 });

        const draft = await prisma.resumeDraft.create({
            data: {
                title,
                userId: DEMO_USER_ID,
                templateId,
                content: content ?? {},
                schema: schema ?? {},
                settings: settings ?? {},
                distribution: distribution ?? {},
                style: style ?? {},
            },
        });
        return NextResponse.json(draft, { status: 201 });
    } catch (error) {
        console.log("Error creating draft:", error);
        return NextResponse.json({ error: "Failed to save draft", details: error }, { status: 400 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, action } = body;
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

        const existing = await prisma.resumeDraft.findFirst({ where: { id, userId: DEMO_USER_ID } });
        if (!existing) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

        const data = action === "activate" && !existing.slug
            ? { slug: `${slugify(existing.title)}-${existing.id.slice(-6)}` }
            : {
                title: body.title ?? existing.title,
                content: body.content ?? existing.content,
                schema: body.schema ?? existing.schema,
                settings: body.settings ?? existing.settings,
                distribution: body.distribution ?? existing.distribution,
                style: body.style ?? existing.style,
            };

        const draft = await prisma.resumeDraft.update({ where: { id }, data });
        return NextResponse.json(draft);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update draft", details: error }, { status: 400 });
    }
}
