import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function ActiveResumePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const draft = await prisma.resumeDraft.findUnique({ where: { slug } });
    if (!draft) notFound();

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8">
            <article className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-6 border-b border-slate-200 pb-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Active resume</p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">{draft.title}</h1>
                </div>
                <pre className="max-h-[75vh] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify({ settings: draft.settings, distribution: draft.distribution, content: draft.content }, null, 2)}</pre>
            </article>
        </main>
    );
}
