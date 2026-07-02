import { prisma } from "@/lib/db";
import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import { SectionTarget, Visibility } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const sections = await prisma.section.findMany();
        return NextResponse.json(sections);
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}
export async function POST(request: NextRequest) {
    try {
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
        const result = await prisma.section.create({
            data: { name, target, visibility, schema, content, authorId }
        });
        return NextResponse.json(result);
    } catch (error) {
        console.log(error);
        return NextResponse.json(error, { status: 400 });
    }
}