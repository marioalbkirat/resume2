import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const templates = await prisma.resumeTemplate.findMany({
            where: { visibility: 'PRIVATE', communityRequested: true },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching community template requests:', error);
        return NextResponse.json({ error: 'Failed to fetch community template requests' }, { status: 500 });
    }
}
