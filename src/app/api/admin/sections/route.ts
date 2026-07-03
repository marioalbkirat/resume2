import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { validateSectionForm } from '@/lib/section/validation';

const ADMIN_ID = "cmqtlhdub0000t9rselto3b16";

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
        const validated = validateSectionForm(await request.json(), { admin: true });
        if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
        const section = await prisma.section.create({ data: { ...validated.data!, schema: validated.data!.schema as unknown as Prisma.InputJsonValue, content: validated.data!.content as unknown as Prisma.InputJsonValue, authorId: ADMIN_ID } });
        return NextResponse.json(section, { status: 201 });
    } catch (error) {
        console.error('Error creating section:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
