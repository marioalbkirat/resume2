import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFilename(value: string) {
    return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "resume";
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const draft = await prisma.resumeDraft.findUnique({ where: { slug }, select: { title: true } });

    if (!draft) {
        return new Response("Resume not found", { status: 404 });
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();
        const exportUrl = new URL(`/resume/${slug}`, request.url);
        exportUrl.searchParams.set("export", "pdf");
        await page.goto(exportUrl.toString(), { waitUntil: "networkidle0" });
        await page.emulateMediaType("print");
        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
        });

        return new Response(Buffer.from(pdf), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${safeFilename(draft.title)}.pdf"`,
                "Cache-Control": "no-store",
            },
        });
    } finally {
        await browser.close();
    }
}
