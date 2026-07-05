"use client";

import Link from "next/link";
import { useState } from "react";
import { FiDownload, FiUpload, FiSave, FiLink, FiGrid, FiFileText, FiEdit3, FiEye, FiLayers, FiStar, FiLoader } from "react-icons/fi";
import { useResumeBuilder } from "@/context/resume/ResumeContext";

export default function ResumeHeader() {
    const { mode, setMode, pageCount, selectedResume, activeDraft, content, resumeDraftSchema, settings, distribution, style, setDrafts, setActiveDraft, setTemplates } = useResumeBuilder();
    const [draftTitle, setDraftTitle] = useState("");
    const [showDraftDialog, setShowDraftDialog] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [templateForm, setTemplateForm] = useState({ name: "", description: "", category: "REGULAR", targetRoles: "", visibility: "PRIVATE" });
    const isEdit = mode === "edit";

    const openDraftDialog = () => {
        setDraftTitle(activeDraft?.title ?? "");
        setShowDraftDialog(true);
    };

    const saveDraft = async () => {
        if (isSavingDraft) return;
        const title = draftTitle.trim();
        const templateId = selectedResume?.id ?? activeDraft?.templateId;
        if (!title || !templateId) return;

        setIsSavingDraft(true);
        try {
            const payload = { title, templateId, content, schema: resumeDraftSchema, settings, distribution, style };
            const response = await fetch("/api/resume/resume-draft", {
                method: activeDraft ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(activeDraft ? { id: activeDraft.id, ...payload } : payload),
            });
            if (!response.ok) return;
            const draft = await response.json();
            setDrafts((previous) => activeDraft ? previous.map((item) => item.id === draft.id ? draft : item) : [draft, ...previous]);
            setActiveDraft(draft);
            setDraftTitle("");
            setShowDraftDialog(false);
        } finally {
            setIsSavingDraft(false);
        }
    };

    const saveAsTemplate = async () => {
        if (!activeDraft) return;
        const formData = new FormData();
        formData.set("draftId", activeDraft.id);
        formData.set("name", templateForm.name);
        formData.set("description", templateForm.description);
        formData.set("category", templateForm.category);
        formData.set("visibility", templateForm.visibility);
        formData.set("targetRoles", JSON.stringify(templateForm.targetRoles.split(",").map((role) => role.trim()).filter(Boolean)));
        const response = await fetch("/api/resume/draft-template", { method: "POST", body: formData });
        if (!response.ok) return;
        const template = await response.json();
        setTemplates((previous) => [template, ...previous]);
        setShowTemplateDialog(false);
    };

    const activateResume = async () => {
        if (!activeDraft) return;
        const response = await fetch("/api/resume/resume-draft", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activeDraft.id, action: "activate" }) });
        if (!response.ok) return;
        const draft = await response.json();
        setActiveDraft(draft);
        setDrafts((previous) => previous.map((item) => item.id === draft.id ? draft : item));
        if (draft.slug) window.open(`/resume/${draft.slug}`, "_blank");
    };

    return (
        <header id="resume-header" className="flex items-center justify-between px-6 py-3 bg-linear-to-r from-slate-50 to-blue-50/30 border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-3"><div className="p-2 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md"><FiFileText className="w-5 h-5 text-white" /></div><div><h1 className="text-lg font-bold text-slate-800">Resume Builder</h1><p className="text-xs text-slate-500">Professional CV Manager</p></div></div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm"><FiLayers className="w-4 h-4" /><span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span></div>
                <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm"><button type="button" onClick={() => setMode("edit")} className={`cursor-pointer flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${isEdit ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}><FiEdit3 className="w-4 h-4" />Edit</button><button type="button" onClick={() => setMode("preview")} className={`cursor-pointer flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${!isEdit ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}><FiEye className="w-4 h-4" />Preview</button></div>
                <button onClick={openDraftDialog} className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:shadow-lg"><FiSave className="w-4 h-4" />Save draft</button>
                {activeDraft && <><button onClick={() => setShowTemplateDialog(true)} className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 border border-amber-200"><FiStar className="w-4 h-4" />Set as Template</button><button onClick={activateResume} className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-200"><FiLink className="w-4 h-4" />Set as active resume</button></>}
                <button className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-200"><FiDownload className="w-4 h-4" />Export</button><button className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-200"><FiUpload className="w-4 h-4" />Import</button><Link href="/dashboard" className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-200"><FiGrid className="w-4 h-4" />Dashboard</Link>
            </div>
            {showDraftDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-bold">Save draft</h2><p className="mt-1 text-sm text-slate-500">Enter a title for this draft.</p><input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Draft title" /><div className="mt-6 flex justify-end gap-2"><button onClick={() => setShowDraftDialog(false)} disabled={isSavingDraft} className="cursor-pointer rounded-lg px-4 py-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button><button onClick={saveDraft} disabled={isSavingDraft || !draftTitle.trim()} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50">{isSavingDraft && <FiLoader className="h-4 w-4 animate-spin" />}<span>{isSavingDraft ? "Saving..." : "Save draft"}</span></button></div></div></div>}
            {showTemplateDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-bold">Save as Template</h2><div className="mt-4 grid gap-3"><input className="rounded-lg border px-3 py-2" placeholder="Template name" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} /><textarea className="rounded-lg border px-3 py-2" placeholder="Description" value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} /><input className="rounded-lg border px-3 py-2" placeholder="Target roles, comma separated" value={templateForm.targetRoles} onChange={(e) => setTemplateForm({ ...templateForm, targetRoles: e.target.value })} /><div className="grid grid-cols-2 gap-3"><select className="rounded-lg border px-3 py-2" value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}><option value="REGULAR">Regular</option><option value="ATS">ATS</option></select><select className="rounded-lg border px-3 py-2" value={templateForm.visibility} onChange={(e) => setTemplateForm({ ...templateForm, visibility: e.target.value })}><option value="PRIVATE">Private</option><option value="COMMUNITY">Community</option></select></div><p className="text-xs text-slate-500">The draft preview image will be used for this template.</p></div><div className="mt-6 flex justify-end gap-2"><button onClick={() => setShowTemplateDialog(false)} className="rounded-lg px-4 py-2 text-slate-600">Cancel</button><button onClick={saveAsTemplate} className="rounded-lg bg-amber-600 px-4 py-2 text-white">Save as Template</button></div></div></div>}
        </header>
    );
}
