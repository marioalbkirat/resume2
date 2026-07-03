import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const draft = await prisma.resumeDraft.findUnique({ where: { id }, include: { template: true, user: { select: { name: true } } } });
    if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const draft = await prisma.resumeDraft.update({
      where: { id },
      data: {
        title: body.title,
        templateId: body.templateId,
        content: (body.content || {}) as Prisma.InputJsonValue,
        schema: (body.schema || {}) as Prisma.InputJsonValue,
        settings: (body.settings || {}) as Prisma.InputJsonValue,
        distribution: (body.distribution || {}) as Prisma.InputJsonValue,
        style: (body.style || {}) as Prisma.InputJsonValue,
        isPinned: body.isPinned || false,
      },
      include: { template: true },
    });
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.resumeDraft.delete({ where: { id } });
    return NextResponse.json({ message: 'Draft deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
  }
}
