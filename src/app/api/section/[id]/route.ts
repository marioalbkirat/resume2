import { prisma } from "@/lib/db";
import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import { SectionTarget, Visibility } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
export async function GET({ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await prisma.section.findUnique({ where: { id } });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, target, visibility, schema, content }: {
            name: string;
            target: SectionTarget;
            visibility: Visibility;
            schema: Schema;
            content: Content;
        } = body;
        // validation
        const authorId: string = "cmqzvcgn80000t9x89yni4fg9";
        const result = await prisma.section.update({ where: { id }, data: { name, target, visibility, schema, content, authorId } });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}