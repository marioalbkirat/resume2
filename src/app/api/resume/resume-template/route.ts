import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const DEMO_USER_ID = "cmqzvcgn80000t9x89yni4fg9";

export async function GET() {
    try {
        const templates = await prisma.resumeTemplate.findMany();
        return NextResponse.json(templates);
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}
export async function POST(request: NextRequest) {
    try {
        await request.json();
        // Template creation is handled by /api/resume/draft-template.
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

        const existing = await prisma.resumeTemplate.findFirst({ where: { id, authorId: DEMO_USER_ID, visibility: "PRIVATE" } });
        if (!existing) return NextResponse.json({ error: "Private template not found" }, { status: 404 });

        await prisma.resumeTemplate.delete({ where: { id } });
        return NextResponse.json({ id });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete private template", details: error }, { status: 400 });
    }
}
