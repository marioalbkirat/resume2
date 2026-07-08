"use client";

import Image from "next/image";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { FiDownload, FiMapPin, FiTrash2 } from "react-icons/fi";

export default function DraftsPanel() {
    const { drafts, activeDraft, activateDraft, deleteDraft, setDrafts, setActiveDraft } = useResumeBuilder();

    const handleTogglePin = async (draftId: string) => {
        const response = await fetch("/api/resume/resume-draft", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: draftId, action: "toggle-pin" }) });
        if (!response.ok) return;
        const draft = await response.json();
        setDrafts(previous => previous.map(item => item.id === draft.id ? draft : item).sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        setActiveDraft(previous => previous?.id === draft.id ? draft : previous);
    };

    const handleDeleteDraft = async (draftId: string, draftTitle: string) => {
        const confirmed = window.confirm(`Delete draft "${draftTitle}"? This cannot be undone.`);
        if (!confirmed) return;
        await deleteDraft(draftId);
    };

    if (!drafts.length) {
        return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No drafts yet. Choose a template, edit it, then click Save draft.</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Resume drafts</h2>
                <p className="text-sm text-slate-500">Open a draft to continue editing, save it as a template, publish it as your active resume, or delete drafts you no longer need.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {drafts.map((draft) => (
                    <div key={draft.id} className={`cursor-pointer overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${activeDraft?.id === draft.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}>
                        <button type="button" onClick={() => activateDraft(draft)} className="block w-full text-left">
                            <div className="relative aspect-3/4 bg-linear-to-br from-slate-100 to-slate-200">
                                {draft.previewImage ? (
                                    <Image fill src={draft.previewImage} alt={`${draft.title} preview`} className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                                ) : (
                                    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">No preview image</div>
                                )}
                            </div>
                        </button>
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <button type="button" onClick={() => activateDraft(draft)} className="min-w-0 flex-1 text-left">
                                    <h3 className="font-semibold text-slate-900">{draft.title}</h3>
                                    <p className="mt-1 text-xs text-slate-500">Updated {new Date(draft.updatedAt).toLocaleString()}</p>
                                </button>
                                <div className="flex items-center gap-2">
                                    {draft.slug && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span>}
                                    <button type="button" onClick={(event) => { event.stopPropagation(); handleTogglePin(draft.id); }} className="rounded-full p-2 text-amber-500 transition hover:bg-amber-50 hover:text-amber-700" title={draft.isPinned ? "Unpin draft" : "Pin draft"} aria-label={`${draft.isPinned ? "Unpin" : "Pin"} ${draft.title}`}><FiMapPin size={16} /></button>
                                    <button type="button" onClick={(event) => { event.stopPropagation(); handleDeleteDraft(draft.id, draft.title); }} className="rounded-full p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700" title="Delete draft" aria-label={`Delete ${draft.title}`}>
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span className="rounded-full bg-slate-100 px-2 py-1">{Object.keys(draft.distribution ?? {}).length} sections</span>
                                {draft.isPinned && <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Pinned</span>}
                                {draft.isDownloaded && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700"><FiDownload size={12} /> Downloaded</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
