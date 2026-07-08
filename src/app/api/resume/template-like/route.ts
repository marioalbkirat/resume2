import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type PrismaTransactionClient = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

const DEMO_USER_ID = "cmqzvcgn80000t9x89yni4fg9";

export async function POST(request: NextRequest) {
    try {
        const { templateId } = await request.json();
        if (!templateId) return NextResponse.json({ error: "templateId is required" }, { status: 400 });

        const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
            const existing = await tx.templateLike.findUnique({ where: { userId_templateId: { userId: DEMO_USER_ID, templateId } } });
            if (existing) {
                await tx.templateLike.delete({ where: { userId_templateId: { userId: DEMO_USER_ID, templateId } } });
                const template = await tx.resumeTemplate.update({ where: { id: templateId }, data: { likes: { decrement: 1 } }, select: { id: true, likes: true } });
                return { ...template, isLiked: false };
            }

            await tx.templateLike.create({ data: { userId: DEMO_USER_ID, templateId } });
            const template = await tx.resumeTemplate.update({ where: { id: templateId }, data: { likes: { increment: 1 } }, select: { id: true, likes: true } });
            return { ...template, isLiked: true };
        });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Failed to toggle template like", details: error }, { status: 400 });
    }
}
