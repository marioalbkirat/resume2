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
        <main className="min-h-screen bg-slate-100 px-4 py-8">
            <article className="mx-auto w-fit rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-6 border-b border-slate-200 pb-4 print:hidden">
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Active resume</p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">{draft.title}</h1>
                </div>
                {style.customCSS && <style>{style.customCSS}</style>}
                <BuildLayout sections={sections} settings={settings} distribution={distribution} content={draft.content as Record<string, Content>} mode="preview" style={style} pageCount={1} />
            </article>
        </main>
    );
}
