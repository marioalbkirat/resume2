import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import ResumeCardWorkspace from "@/app/resume/components/cards/ResumeCardWorkspace";
import TemplatesFilter from "./templates/filter";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { ResumeTemplate } from "@/types/resume/ResumeTemplate";
import { Settings } from "@/types/resume/Settings";

const blankSettings: Settings = { fileName: "Blank_Resume", direction: "LTR", pageSize: "A4", showIcons: true, columns: "TWO", sidebar: { position: "LEFT" } };

export default function TemplatesPanel() {
    const { templates, selectedResume, activateTemplate, startBlankDraft } = useResumeBuilder();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [activeSource, setActiveSource] = useState<"OFFICIAL" | "COMMUNITY" | "PRIVATE">("OFFICIAL");
    const [showBlankDialog, setShowBlankDialog] = useState(false);
    const [draftSettings, setDraftSettings] = useState<Settings>(blankSettings);

    const categories = [
        { id: "all", label: "All Templates", icon: "🎨", count: templates.length },
        { id: "ATS", label: "ATS", icon: "📊", count: templates.filter(t => t.category === "ATS").length },
        { id: "REGULAR", label: "REGULAR", icon: "📄", count: templates.filter(t => t.category === "REGULAR").length },
    ];
    const getTemplatesBySource = (): ResumeTemplate[] => {
        if (activeSource === "OFFICIAL") return templates.filter(t => t.visibility === "OFFICIAL");
        if (activeSource === "COMMUNITY") return templates.filter(t => t.visibility === "COMMUNITY");
        return templates.filter(t => t.visibility === "PRIVATE");
    };
    const filteredTemplates = getTemplatesBySource().filter((template) => (activeCategory === "all" || template.category === activeCategory) && template.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleSelectTemplate = (id: string) => {
        const temp = templates.find(e => e.id === id);
        if (temp) activateTemplate(temp);
    };
    const resetBlankDialog = () => {
        setShowBlankDialog(false);
    };
    const updateDraftColumns = (columns: "ONE" | "TWO") => {
        setDraftSettings(p => ({ ...p, columns }));
    };
    const createBlankDraft = () => {
        startBlankDraft(draftSettings, {});
        resetBlankDialog();
    };

    return (
        <div className="space-y-6">
            <TemplatesFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeSource={activeSource} setActiveSource={setActiveSource} categories={categories} getTemplatesBySource={getTemplatesBySource} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                <div onClick={() => setShowBlankDialog(true)} className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg overflow-hidden transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 border-2 border-dashed border-blue-300">
                    <div className="relative bg-linear-to-br from-blue-100 to-purple-100 aspect-3/4 flex items-center justify-center">
                        <div className="text-center"><div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"><FiPlus className="w-10 h-10 text-white" /></div><h3 className="text-xl font-bold text-gray-900">Start From Scratch</h3><p className="text-gray-600 text-sm mt-2 px-4">Configure settings, then choose sections</p></div>
                    </div>
                    <div className="p-3 text-center"><h4 className="font-semibold text-blue-600 text-sm">Blank Canvas</h4><p className="text-xs text-gray-500 mt-1">Choose sections from the Sections panel</p></div>
                </div>
                {filteredTemplates.map((template) => <ResumeCardWorkspace key={template.id} id={template.id} name={template.name} previewImage={template.previewImage} views={template.views} downloads={template.downloads} likes={template.likes} isSelected={(selectedResume?.id ?? "") === template.id} authorName={template.visibility === "COMMUNITY" ? template.authorId : undefined} onClick={handleSelectTemplate} />)}
            </div>
            {showBlankDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-gray-200 p-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Start From Scratch</h3>
                                <p className="mt-1 text-sm text-gray-500">Configure the blank resume settings. Sections stay empty until you choose them from the Sections panel.</p>
                            </div>
                            <button type="button" onClick={resetBlankDialog} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900" aria-label="Close start from scratch dialog"><FiX /></button>
                        </div>
                        <div className="grid max-h-[75vh] grid-cols-1 gap-8 overflow-y-auto p-6 lg:grid-cols-2">
                            <div className="space-y-6">
                                <div className="rounded-xl bg-gray-50 p-5">
                                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm text-white">1</span>
                                        Basic Settings
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-medium text-gray-700">File name</span>
                                            <input value={draftSettings.fileName} onChange={(e) => setDraftSettings(p => ({ ...p, fileName: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                                        </label>
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-medium text-gray-700">Language Direction</span>
                                            <select value={draftSettings.direction} onChange={(e) => setDraftSettings(p => ({ ...p, direction: e.target.value as "LTR" | "RTL" }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"><option value="LTR">LTR</option><option value="RTL">RTL</option></select>
                                        </label>
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-medium text-gray-700">Page Size</span>
                                            <select value={draftSettings.pageSize} onChange={(e) => setDraftSettings(p => ({ ...p, pageSize: e.target.value as "A4" | "LETTER" }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"><option value="A4">A4 (210 × 297mm)</option><option value="LETTER">Letter (8.5 × 11in)</option></select>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input type="checkbox" checked={draftSettings.showIcons} onChange={(e) => setDraftSettings(p => ({ ...p, showIcons: e.target.checked }))} className="h-4 w-4 rounded text-blue-500" />
                                            <span className="text-sm text-gray-700">Show icons in sections</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-5">
                                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm text-white">2</span>
                                        Layout Settings
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="mb-2 block text-sm font-medium text-gray-700">Column Layout</span>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button type="button" onClick={() => updateDraftColumns("ONE")} className={`rounded-lg border-2 p-3 text-center transition ${draftSettings.columns === "ONE" ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                                                    <div className="mb-2 h-16 w-full rounded bg-gray-200"></div>
                                                    <span className="text-sm font-medium">Single Column</span>
                                                    {draftSettings.columns === "ONE" && <div className="mt-1 text-xs text-blue-500">✓ Selected</div>}
                                                </button>
                                                <button type="button" onClick={() => updateDraftColumns("TWO")} className={`rounded-lg border-2 p-3 text-center transition ${draftSettings.columns === "TWO" ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                                                    <div className="mb-2 flex h-16 gap-1">
                                                        <div className="w-1/3 rounded bg-gray-300"></div>
                                                        <div className="w-2/3 rounded bg-gray-200"></div>
                                                    </div>
                                                    <span className="text-sm font-medium">Two Columns</span>
                                                    {draftSettings.columns === "TWO" && <div className="mt-1 text-xs text-blue-500">✓ Selected</div>}
                                                </button>
                                            </div>
                                        </div>
                                        {draftSettings.columns === "TWO" && (
                                            <div>
                                                <span className="mb-2 block text-sm font-medium text-gray-700">Sidebar Position</span>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button type="button" onClick={() => setDraftSettings(p => ({ ...p, sidebar: { position: "LEFT" } }))} className={`rounded-lg border-2 p-2 text-center transition ${draftSettings.sidebar?.position === "LEFT" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>Left</button>
                                                    <button type="button" onClick={() => setDraftSettings(p => ({ ...p, sidebar: { position: "RIGHT" } }))} className={`rounded-lg border-2 p-2 text-center transition ${draftSettings.sidebar?.position === "RIGHT" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>Right</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-5">
                                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm text-white">3</span>
                                    Blank Resume Preview
                                </h3>
                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                                        <div>
                                            <div className="h-4 w-36 rounded bg-blue-500"></div>
                                            <div className="mt-2 h-2 w-24 rounded bg-gray-200"></div>
                                        </div>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{draftSettings.pageSize}</span>
                                    </div>
                                    <div className={draftSettings.columns === "TWO" ? "grid grid-cols-[1fr_2fr] gap-4" : "space-y-4"} dir={draftSettings.direction.toLowerCase()}>
                                        {draftSettings.columns === "TWO" && draftSettings.sidebar?.position !== "RIGHT" && <div className="space-y-3 rounded-lg bg-gray-100 p-3"><div className="h-3 w-16 rounded bg-gray-300"></div><div className="h-2 rounded bg-gray-200"></div><div className="h-2 w-4/5 rounded bg-gray-200"></div></div>}
                                        <div className="space-y-3 rounded-lg bg-gray-50 p-3"><div className="h-3 w-24 rounded bg-gray-300"></div><div className="h-2 rounded bg-gray-200"></div><div className="h-2 rounded bg-gray-200"></div><div className="h-2 w-2/3 rounded bg-gray-200"></div></div>
                                        {draftSettings.columns === "TWO" && draftSettings.sidebar?.position === "RIGHT" && <div className="space-y-3 rounded-lg bg-gray-100 p-3"><div className="h-3 w-16 rounded bg-gray-300"></div><div className="h-2 rounded bg-gray-200"></div><div className="h-2 w-4/5 rounded bg-gray-200"></div></div>}
                                    </div>
                                </div>
                                <p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">Settings only — after creating the draft, go to Resume Sections to add sections and fill the distribution.</p>
                            </div>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-gray-200 p-6">
                            <button type="button" onClick={resetBlankDialog} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200">Cancel</button>
                            <button type="button" onClick={createBlankDraft} className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700">Create Draft</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
