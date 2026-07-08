import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.resumeTemplate.findUnique({ where: { id }, select: { visibility: true } });
        if (!existing) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        if (existing.visibility !== 'OFFICIAL') return NextResponse.json({ error: 'Only OFFICIAL templates can be edited' }, { status: 403 });

        const template = await prisma.resumeTemplate.update({
            where: { id },
            data: {
                name: body.name,
                targetRoles: Array.isArray(body.targetRoles) ? body.targetRoles : [],
                description: body.description,
                previewImage: body.previewImage,
                category: body.category as 'ATS' | 'REGULAR',
            },
            include: { user: { select: { name: true, email: true, isAdmin: true } } },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error updating template:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const existing = await prisma.resumeTemplate.findUnique({
            where: { id },
            select: { visibility: true, _count: { select: { drafts: true } } },
        });

        if (!existing) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        if (existing.visibility !== 'OFFICIAL') return NextResponse.json({ error: 'Only OFFICIAL templates can be deleted' }, { status: 403 });
        if (existing._count.drafts > 0) {
            return NextResponse.json({ error: 'Cannot delete a template that has resume drafts' }, { status: 409 });
        }

        await prisma.resumeTemplate.delete({ where: { id } });
        return NextResponse.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
}
