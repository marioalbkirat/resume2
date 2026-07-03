import { prisma } from "@/lib/db";
import { validateSectionForm } from "@/lib/section/validation";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const CURRENT_USER_ID = "cmqtlhdub0000t9rselto3b16";

export async function GET() {
    try {
        const sections = await prisma.section.findMany({
            where: { OR: [{ authorId: CURRENT_USER_ID }, { visibility: "OFFICIAL" }, { visibility: "COMMUNITY", NOT: { authorId: CURRENT_USER_ID } }] },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(sections);
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}
export async function POST(request: NextRequest) {
    try {
        const validated = validateSectionForm(await request.json());
        if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
        const result = await prisma.section.create({ data: { ...validated.data!, visibility: validated.data!.visibility === "OFFICIAL" ? "PRIVATE" : validated.data!.visibility, schema: validated.data!.schema as unknown as Prisma.InputJsonValue, content: validated.data!.content as unknown as Prisma.InputJsonValue, authorId: CURRENT_USER_ID } });
        return NextResponse.json(result);
    } catch (error) {
        console.log(error);
        return NextResponse.json(error, { status: 400 });
    }
}
