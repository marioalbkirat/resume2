import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const draft = await prisma.draft.findUnique({
      where: { id: params.id },
      include: {
        template: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        publishedResumes: true,
      },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const draft = await prisma.draft.update({
      where: { id: params.id },
      data: {
        title: body.title,
        templateId: body.templateId,
        content: body.content || {},
        overrides: body.overrides || {},
        isPinned: body.isPinned || false,
      },
      include: {
        template: true,
      },
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.draft.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Draft deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}