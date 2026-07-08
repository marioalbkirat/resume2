import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const existing = await prisma.resumeTemplate.findUnique({ where: { id }, select: { visibility: true, communityRequested: true } });
        if (!existing) return NextResponse.json({ error: 'Template request not found' }, { status: 404 });
        if (existing.visibility !== 'PRIVATE' || !existing.communityRequested) return NextResponse.json({ error: 'Template is not pending community approval' }, { status: 409 });

        const template = await prisma.resumeTemplate.update({
            where: { id },
            data: { visibility: 'COMMUNITY', communityRequested: false },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        return NextResponse.json(template);
    } catch (error) {
        console.error('Error approving community template request:', error);
        return NextResponse.json({ error: 'Failed to approve community template request' }, { status: 500 });
    }
}
