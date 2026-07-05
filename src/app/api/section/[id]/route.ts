import { prisma } from "@/lib/db";
import { SectionValidation } from "@/classes/section/SectionValidation";
import { NextRequest, NextResponse } from "next/server";

const CURRENT_USER_ID = "cmqzvfuwr0001t9x8hf4jp9n6";
const ADMIN_USER_ID = "cmqzvcgn80000t9x89yni4fg9";
const validation = new SectionValidation();
function message(error: unknown) { return error instanceof Error ? error.message : "Section request failed."; }

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await prisma.section.findUnique({ where: { id } });
        return result ? NextResponse.json(result) : NextResponse.json(null, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: message(error) }, { status: 400 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const raw = await request.json();
        const validated = validation.validateSectionForm(raw, { admin: raw?.visibility === "OFFICIAL" });
        const authorId = validated.visibility === "OFFICIAL" ? ADMIN_USER_ID : CURRENT_USER_ID;
        const duplicate = await prisma.section.findFirst({ where: { authorId, name: validated.name, NOT: { id } }, select: { id: true } });
        if (duplicate) return NextResponse.json({ error: "You already have a section with this name." }, { status: 409 });
        const updated = await prisma.section.updateMany({ where: { id, authorId }, data: { ...validated, schema: validated.schema as never, content: validated.content as never } });
        if (!updated.count) return NextResponse.json({ error: "Section not found or not owned by user" }, { status: 404 });
        const result = await prisma.section.findUnique({ where: { id } });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: message(error) }, { status: 400 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const deleted = await prisma.section.deleteMany({ where: { id, OR: [{ authorId: CURRENT_USER_ID }, { authorId: ADMIN_USER_ID }] } });
        if (!deleted.count) return NextResponse.json({ error: "Section not found or not owned by user" }, { status: 404 });
        return NextResponse.json({ message: "Section deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: message(error) }, { status: 400 });
    }
}
