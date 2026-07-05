import { prisma } from "@/lib/db";
import BuildLayout from "@/hooks/Canava/BuildLayout";
import { notFound } from "next/navigation";
import { normalizeResumeDistribution, normalizeResumeSettings, normalizeResumeStyle, toResumeSections } from "@/lib/resume/render";
import { Content } from "@/types/resume/Content";

export default async function ResumePreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const draft = await prisma.resumeDraft.findUnique({ where: { id } });
    if (!draft) notFound();

    const settings = normalizeResumeSettings(draft.settings);
    const distribution = normalizeResumeDistribution(draft.distribution);
    const style = normalizeResumeStyle(draft.style);
    const sections = toResumeSections(draft.schema);

    return (
        <main className="min-h-screen bg-white p-0">
            {style.customCSS && <style>{style.customCSS}</style>}
            <BuildLayout sections={sections} settings={settings} distribution={distribution} content={draft.content as Record<string, Content>} mode="preview" style={style} pageCount={1} />
        </main>
    );
}
