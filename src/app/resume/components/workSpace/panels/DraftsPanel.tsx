"use client";

import { useResumeBuilder } from "@/context/resume/ResumeContext";

export default function DraftsPanel() {
    const { drafts, activeDraft, activateDraft } = useResumeBuilder();

    if (!drafts.length) {
        return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No drafts yet. Choose a template, edit it, then click Save draft.</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Resume drafts</h2>
                <p className="text-sm text-slate-500">Open a draft to continue editing, save it as a template, or publish it as your active resume.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {drafts.map((draft) => (
                    <button key={draft.id} type="button" onClick={() => activateDraft(draft)} className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${activeDraft?.id === draft.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-semibold text-slate-900">{draft.title}</h3>
                                <p className="mt-1 text-xs text-slate-500">Updated {new Date(draft.updatedAt).toLocaleString()}</p>
                            </div>
                            {draft.slug && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span>}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2 py-1">{Object.keys(draft.distribution ?? {}).length} sections</span>
                            {draft.isPinned && <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Pinned</span>}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
