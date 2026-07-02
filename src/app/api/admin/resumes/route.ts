import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const drafts = await prisma.draft.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        template: {
          select: {
            name: true,
            visibility: true,
          },
        },
        publishedResumes: true,
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Get current user from session (implement your auth)
    const userId = 'current_user_id'; // Replace with actual user ID
    
    const draft = await prisma.draft.create({
      data: {
        title: body.title,
        userId: userId,
        templateId: body.templateId,
        content: body.content || {},
        overrides: body.overrides || {},
        isPinned: body.isPinned || false,
      },
      include: {
        template: true,
        user: true,
      },
    });

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}