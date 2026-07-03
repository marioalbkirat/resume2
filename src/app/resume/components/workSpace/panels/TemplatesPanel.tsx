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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 p-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Start From Scratch</h3>
                                <p className="mt-1 text-sm text-gray-500">Configure the resume settings. Sections stay empty until you choose them from SectionsPanel.</p>
                            </div>
                            <button onClick={resetBlankDialog} className="rounded-lg p-2 hover:bg-gray-100"><FiX /></button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">1</span>
                                <span>Settings only — after creating the draft, go to Resume Sections to add sections and fill the distribution.</span>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2"><span className="text-sm font-medium text-gray-700">File name</span><input value={draftSettings.fileName} onChange={(e) => setDraftSettings(p => ({ ...p, fileName: e.target.value }))} className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500" /></label>
                                <label className="space-y-2"><span className="text-sm font-medium text-gray-700">Writing direction</span><select value={draftSettings.direction} onChange={(e) => setDraftSettings(p => ({ ...p, direction: e.target.value as "LTR" | "RTL" }))} className="w-full rounded-lg border border-gray-300 p-3"><option value="LTR">LTR</option><option value="RTL">RTL</option></select></label>
                                <label className="space-y-2"><span className="text-sm font-medium text-gray-700">Page size</span><select value={draftSettings.pageSize} onChange={(e) => setDraftSettings(p => ({ ...p, pageSize: e.target.value as "A4" | "LETTER" }))} className="w-full rounded-lg border border-gray-300 p-3"><option value="A4">A4</option><option value="LETTER">Letter</option></select></label>
                                <label className="space-y-2"><span className="text-sm font-medium text-gray-700">Column layout</span><select value={draftSettings.columns} onChange={(e) => updateDraftColumns(e.target.value as "ONE" | "TWO")} className="w-full rounded-lg border border-gray-300 p-3"><option value="ONE">One column</option><option value="TWO">Two columns</option></select></label>
                                {draftSettings.columns === "TWO" && <label className="space-y-2"><span className="text-sm font-medium text-gray-700">Sidebar position</span><select value={draftSettings.sidebar?.position ?? "LEFT"} onChange={(e) => setDraftSettings(p => ({ ...p, sidebar: { position: e.target.value as "LEFT" | "RIGHT" } }))} className="w-full rounded-lg border border-gray-300 p-3"><option value="LEFT">Sidebar left</option><option value="RIGHT">Sidebar right</option></select></label>}
                                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"><input type="checkbox" checked={draftSettings.showIcons} onChange={(e) => setDraftSettings(p => ({ ...p, showIcons: e.target.checked }))} /> <span className="text-sm font-medium text-gray-700">Show all icons</span></label>
                            </div>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-gray-200 p-6">
                            <button onClick={resetBlankDialog} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">Cancel</button>
                            <button onClick={createBlankDraft} className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">Create Draft</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
