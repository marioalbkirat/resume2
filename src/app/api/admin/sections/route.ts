import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
// import { Section } from '@/types/resume/Section';
export async function GET() {
    try {
        const sections = await prisma.section.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json(sections);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, target, visibility, schema, content, isArchived } = body;
        const authorId = "cmqtlhdub0000t9rselto3b16";
        if (!name || !target || !visibility || !schema) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        if (!['RESUME', 'PORTFOLIO'].includes(target)) {
            return NextResponse.json({ error: 'Invalid target value' }, { status: 400 });
        }
        if (!['COMMUNITY', 'PRIVATE', 'OFFICIAL'].includes(visibility)) {
            return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 });
        }
        const section = await prisma.section.create({
            data: {
                name,
                target,
                visibility,
                schema: schema || {},
                content: content || {},
                isArchived: isArchived ?? false,
                authorId: authorId || null,
            },
        });

        return NextResponse.json(section, { status: 201 });
    } catch (error) {
        console.error('Error creating section:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/admin/sections/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { name, target, visibility, schema } = body;

        const section = await prisma.section.update({
            where: { id: params.id },
            data: {
                name,
                target,
                visibility,
                schema: schema || {},
            },
        });

        return NextResponse.json(section);
    } catch (error) {
        console.error('Error updating section:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/admin/sections/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await prisma.section.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Error deleting section:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}