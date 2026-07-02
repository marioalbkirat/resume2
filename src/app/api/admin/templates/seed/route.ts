import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const authorId = "cmqtlhdub0000t9rselto3b16";
const settings = { fileName: "Seed_Resume", direction: "LTR", pageSize: "A4", showIcons: true, columns: "TWO", sidebar: { position: "LEFT" } };

export async function POST() {
    const user = await prisma.user.upsert({ where: { id: authorId }, update: {}, create: { id: authorId, name: "Seed User" } });
    const createTemplate = (category: "ATS" | "REGULAR") => prisma.resumeTemplate.create({ data: { name: `${category} Starter Template`, visibility: "OFFICIAL", previewImage: "", category, targetRoles: ["General"], description: `${category} seeded resume template`, settings, distribution: {}, style: {}, content: {}, authorId: user.id } });
    const [ats, regular] = await Promise.all([createTemplate("ATS"), createTemplate("REGULAR")]);
    return NextResponse.json({ ats, regular }, { status: 201 });
}
