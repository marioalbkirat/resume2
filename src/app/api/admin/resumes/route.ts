import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

const CURRENT_USER_ID = 'cmqtlhdub0000t9rselto3b16';

export async function GET() {
  try {
    const drafts = await prisma.resumeDraft.findMany({
      include: { user: { select: { name: true } }, template: { select: { name: true, visibility: true } } },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
    return NextResponse.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const draft = await prisma.resumeDraft.create({
      data: {
        title: body.title,
        userId: body.userId || CURRENT_USER_ID,
        templateId: body.templateId,
        content: (body.content || {}) as Prisma.InputJsonValue,
        schema: (body.schema || {}) as Prisma.InputJsonValue,
        settings: (body.settings || {}) as Prisma.InputJsonValue,
        distribution: (body.distribution || {}) as Prisma.InputJsonValue,
        style: (body.style || {}) as Prisma.InputJsonValue,
        isPinned: body.isPinned || false,
      },
      include: { template: true, user: true },
    });
    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}
