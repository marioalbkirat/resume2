import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const CURRENT_USER_ID = "cmqzvfuwr0001t9x8hf4jp9n6";
const ADMIN_USER_ID = "cmqzvcgn80000t9x89yni4fg9";

function message(error: unknown) { return error instanceof Error ? error.message : "Section request failed."; }

export async function GET() {
    try {
        const sections = await prisma.section.findMany({
            where: { OR: [{ authorId: CURRENT_USER_ID }, { visibility: "OFFICIAL" }, { visibility: "COMMUNITY", NOT: { authorId: CURRENT_USER_ID } }] },
            include: { user: { select: { email: true, isAdmin: true } } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(sections);
    } catch (error) {
        return NextResponse.json({ error: message(error) }, { status: 400 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const raw = await request.json();
        const authorId = raw.visibility === "OFFICIAL" ? ADMIN_USER_ID : CURRENT_USER_ID;
        const duplicate = await prisma.section.findFirst({ where: { authorId, name: raw.name }, select: { id: true } });
        if (duplicate) return NextResponse.json({ error: "You already have a section with this name." }, { status: 409 });
        const result = await prisma.section.create({ data: { ...raw, schema: raw.schema as never, content: raw.content as never, authorId } });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: message(error) }, { status: 400 });
    }
}
