"use client";

import Link from "next/link";
import { ChangeEvent, useRef, useState } from "react";
import { FiDownload, FiUpload, FiSave, FiLink, FiGrid, FiFileText, FiEdit3, FiEye, FiLayers, FiStar, FiLoader } from "react-icons/fi";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { Content } from "@/types/resume/Content";

export default function ResumeHeader() {
    const { mode, setMode, pageCount, selectedResume, activeDraft, content, setContent, resumeDraftSchema, settings, distribution, style, setDrafts, setActiveDraft, setTemplates } = useResumeBuilder();
    const [draftTitle, setDraftTitle] = useState("");
    const [showDraftDialog, setShowDraftDialog] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [templateForm, setTemplateForm] = useState({ name: "", description: "", category: "REGULAR", targetRoles: "", visibility: "PRIVATE" });
    const [importStatus, setImportStatus] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const importInputRef = useRef<HTMLInputElement>(null);
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

    const downloadActiveResume = () => {
        if (!activeDraft?.slug) return;
        window.location.href = `/api/resume/download/${activeDraft.slug}`;
    };

    const importResumePdf = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || isImporting) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setImportStatus("Please choose a PDF resume/CV file.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setImportStatus("PDF is too large. Maximum size is 2MB.");
            return;
        }

        setIsImporting(true);
        setImportStatus("Reading PDF...");
        try {
            const fileBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
                reader.onerror = () => reject(new Error("Could not read the selected PDF."));
                reader.readAsDataURL(file);
            });

            setImportStatus("AI is extracting resume content...");
            const response = await fetch("/api/resume/import-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: file.name, fileBase64, schema: resumeDraftSchema, content }),
            });
            const result = await response.json();
            if (!response.ok) {
                setImportStatus(result.error || "Could not import this PDF.");
                return;
            }

            const entries = Object.entries((result.content || {}) as Record<string, Content>);
            if (!entries.length) {
                setImportStatus("No matching resume fields were found in this PDF.");
                return;
            }

            setMode("edit");
            setImportStatus("Rendering imported content...");
            for (let index = 0; index < entries.length; index += 1) {
                const [id, value] = entries[index];
                setContent(previous => ({ ...previous, [id]: value }));
                await new Promise(resolve => setTimeout(resolve, 90));
            }
            setImportStatus(`Imported ${entries.length} fields smoothly.`);
        } catch (error) {
            setImportStatus(error instanceof Error ? error.message : "Could not import this PDF.");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <header id="resume-header" className="relative flex flex-col gap-3 border-b border-slate-200 bg-linear-to-r from-slate-50 to-blue-50/30 px-3 py-3 shadow-sm sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex items-center gap-3"><div className="p-2 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md"><FiFileText className="w-5 h-5 text-white" /></div><div><h1 className="text-lg font-bold text-slate-800">Resume Builder</h1><p className="text-xs text-slate-500">Professional CV Manager</p></div></div>
            <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 lg:w-auto lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0">
                <div className="flex shrink-0 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm"><FiLayers className="w-4 h-4" /><span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span></div>
                <div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"><button type="button" onClick={() => setMode("edit")} className={`cursor-pointer flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${isEdit ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}><FiEdit3 className="w-4 h-4" /><span className="hidden sm:inline">Edit</span></button><button type="button" onClick={() => setMode("preview")} className={`cursor-pointer flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${!isEdit ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}><FiEye className="w-4 h-4" /><span className="hidden sm:inline">Preview</span></button></div>
                <button onClick={openDraftDialog} className="cursor-pointer flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:shadow-lg"><FiSave className="w-4 h-4" /><span className="hidden sm:inline">Save draft</span><span className="sm:hidden">Save</span></button>
                {activeDraft && <><button onClick={() => setShowTemplateDialog(true)} className="cursor-pointer flex shrink-0 items-center gap-2 px-3.5 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 border border-amber-200"><FiStar className="w-4 h-4" /><span className="hidden sm:inline">Set as Template</span><span className="sm:hidden">Template</span></button><button onClick={activateResume} className="cursor-pointer flex shrink-0 items-center gap-2 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-200"><FiLink className="w-4 h-4" /><span className="hidden sm:inline">Set as active resume</span><span className="sm:hidden">Active</span></button></>}
                <button type="button" onClick={downloadActiveResume} disabled={!activeDraft?.slug} className="cursor-pointer flex shrink-0 items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-200 disabled:cursor-not-allowed disabled:opacity-50"><FiDownload className="w-4 h-4" />Export</button><input ref={importInputRef} type="file" accept="application/pdf" onChange={importResumePdf} className="hidden" /><button type="button" onClick={() => importInputRef.current?.click()} disabled={isImporting} title={importStatus || "Import PDF resume/CV"} className="cursor-pointer flex shrink-0 items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-200 disabled:cursor-not-allowed disabled:opacity-50">{isImporting ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiUpload className="w-4 h-4" />}<span>Import</span></button><Link href="/dashboard" className="cursor-pointer flex shrink-0 items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-200"><FiGrid className="w-4 h-4" /><span className="hidden sm:inline">Dashboard</span><span className="sm:hidden">Dash</span></Link>
            </div>
            {importStatus && <div className="absolute left-3 right-3 top-full z-40 mt-2 rounded-xl border border-blue-100 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-lg sm:left-auto sm:right-6 sm:max-w-sm">{importStatus}</div>}
            {showDraftDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><h2 className="text-lg font-bold">Save draft</h2><p className="mt-1 text-sm text-slate-500">Enter a title for this draft.</p><input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Draft title" /><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setShowDraftDialog(false)} disabled={isSavingDraft} className="cursor-pointer rounded-lg px-4 py-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button><button onClick={saveDraft} disabled={isSavingDraft || !draftTitle.trim()} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50">{isSavingDraft && <FiLoader className="h-4 w-4 animate-spin" />}<span>{isSavingDraft ? "Saving..." : "Save draft"}</span></button></div></div></div>}
            {showTemplateDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><h2 className="text-lg font-bold">Save as Template</h2><div className="mt-4 grid gap-3"><input className="rounded-lg border px-3 py-2" placeholder="Template name" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} /><textarea className="rounded-lg border px-3 py-2" placeholder="Description" value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} /><input className="rounded-lg border px-3 py-2" placeholder="Target roles, comma separated" value={templateForm.targetRoles} onChange={(e) => setTemplateForm({ ...templateForm, targetRoles: e.target.value })} /><div className="grid grid-cols-2 gap-3"><select className="rounded-lg border px-3 py-2" value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}><option value="REGULAR">Regular</option><option value="ATS">ATS</option></select><select className="rounded-lg border px-3 py-2" value={templateForm.visibility} onChange={(e) => setTemplateForm({ ...templateForm, visibility: e.target.value })}><option value="PRIVATE">Private</option><option value="COMMUNITY">Community</option></select></div><p className="text-xs text-slate-500">The draft preview image will be used for this template.</p></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setShowTemplateDialog(false)} className="rounded-lg px-4 py-2 text-slate-600">Cancel</button><button onClick={saveAsTemplate} className="rounded-lg bg-amber-600 px-4 py-2 text-white">Save as Template</button></div></div></div>}
        </header>
    );
}
