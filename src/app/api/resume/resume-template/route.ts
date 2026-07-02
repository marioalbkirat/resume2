import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const templates = await prisma.resumeTemplate.findMany();
        return NextResponse.json(templates);
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}
export async function POST(request: NextRequest) {
    try {
        const body = request.json();
        const { name, visibility, previewImage, category, targetRoles, settings, distribution, styles } = body;
        // validation
        // store
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}