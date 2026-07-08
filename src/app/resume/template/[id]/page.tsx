import BuildLayout from "@/hooks/Canava/BuildLayout";
import { prisma } from "@/lib/db";
import { normalizeResumeDistribution, normalizeResumeSettings, normalizeResumeStyle } from "@/lib/resume/render";
import { Content } from "@/types/resume/Content";
import { notFound } from "next/navigation";

export default async function ResumeTemplatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ export?: string }> }) {
    const { id } = await params;
    const isExport = (await searchParams).export === "pdf";
    const template = await prisma.resumeTemplate.findUnique({ where: { id } });
    if (!template) notFound();

    const settings = normalizeResumeSettings(template.settings);
    const distribution = normalizeResumeDistribution(template.distribution);
    const style = normalizeResumeStyle(template.style);
    const sectionIds = Object.keys(distribution);
    const sections = sectionIds.length ? await prisma.section.findMany({ where: { id: { in: sectionIds } } }) : [];

    return (
        <main className={isExport ? "m-0 w-fit p-0" : "min-h-screen px-4 py-8 mx-auto w-fit"}>
            {!isExport && <a href={`/api/resume/download-template/${id}`} className="mb-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 print:hidden">Download PDF</a>}
            <BuildLayout sections={sections} settings={settings} distribution={distribution} content={template.content as Record<string, Content>} mode="preview" style={style} pageCount={1} exportMode={isExport} />
        </main>
    );
}
