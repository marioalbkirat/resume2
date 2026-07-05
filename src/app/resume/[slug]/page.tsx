import { prisma } from "@/lib/db";
import BuildLayout from "@/hooks/Canava/BuildLayout";
import { notFound } from "next/navigation";
import { normalizeResumeDistribution, normalizeResumeSettings, normalizeResumeStyle, toResumeSections } from "@/lib/resume/render";
import { Content } from "@/types/resume/Content";

export default async function ActiveResumePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const draft = await prisma.resumeDraft.findUnique({ where: { slug } });
    if (!draft) notFound();

    const settings = normalizeResumeSettings(draft.settings);
    const distribution = normalizeResumeDistribution(draft.distribution);
    const style = normalizeResumeStyle(draft.style);
    const sections = toResumeSections(draft.schema);

    return (
        <main className="min-h-screen px-4 py-8 mx-auto w-fit">
            <a href={`/api/resume/download/${slug}`} className="mb-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 print:hidden">Download PDF</a>
            {style.customCSS && <style>{style.customCSS}</style>}
            <BuildLayout sections={sections} settings={settings} distribution={distribution} content={draft.content as Record<string, Content>} mode="preview" style={style} pageCount={1} />
        </main>
    );
}
