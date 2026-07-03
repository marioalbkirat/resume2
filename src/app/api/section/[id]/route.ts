import { prisma } from "@/lib/db";
import { validateSectionForm } from "@/lib/section/validation";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const CURRENT_USER_ID = "cmqtlhdub0000t9rselto3b16";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await prisma.section.findUnique({ where: { id } });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const validated = validateSectionForm(await request.json());
        if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
        const updated = await prisma.section.updateMany({ where: { id, authorId: CURRENT_USER_ID }, data: { ...validated.data!, schema: validated.data!.schema as unknown as Prisma.InputJsonValue, content: validated.data!.content as unknown as Prisma.InputJsonValue } });
        if (!updated.count) return NextResponse.json({ error: "Section not found or not owned by user" }, { status: 404 });
        const result = await prisma.section.findUnique({ where: { id } });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const deleted = await prisma.section.deleteMany({ where: { id, authorId: CURRENT_USER_ID } });
        if (!deleted.count) return NextResponse.json({ error: "Section not found or not owned by user" }, { status: 404 });
        return NextResponse.json({ message: "Section deleted successfully" });
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}
