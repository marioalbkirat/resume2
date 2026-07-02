// D:\cvBuilder\resumebuilder\src\app\api\admin\sections\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/sections/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const section = await prisma.section.findUnique({
            where: { id },
        });

        if (!section) {
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }

        return NextResponse.json(section);
    } catch (error) {
        console.error('Error fetching section:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/admin/sections/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, target, visibility, schema } = body;

        // التحقق من صحة البيانات
        if (!name || !target || !visibility) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const section = await prisma.section.update({
            where: { id },
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;


        await prisma.section.delete({
            where: { id },
        });

        return NextResponse.json({
            message: "Section deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting section:", error);

        return NextResponse.json(
            {
                message: "Failed to delete section",
            },
            { status: 500 }
        );
    }
}