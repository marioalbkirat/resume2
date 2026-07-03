import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { validateSectionForm } from '@/lib/section/validation';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const section = await prisma.section.findUnique({ where: { id } });
        if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        return NextResponse.json(section);
    } catch (error) {
        console.error('Error fetching section:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const validated = validateSectionForm(await request.json(), { admin: true });
        if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
        const section = await prisma.section.update({ where: { id }, data: { ...validated.data!, schema: validated.data!.schema as unknown as Prisma.InputJsonValue, content: validated.data!.content as unknown as Prisma.InputJsonValue } });
        return NextResponse.json(section);
    } catch (error) {
        console.error('Error updating section:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.section.delete({ where: { id } });
        return NextResponse.json({ message: "Section deleted successfully" });
    } catch (error) {
        console.error("Error deleting section:", error);
        return NextResponse.json({ message: "Failed to delete section" }, { status: 500 });
    }
}
