import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import ResumeCardWorkspace from "@/app/resume/components/cards/ResumeCardWorkspace";
import TemplatesFilter from "./templates/filter";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { ResumeTemplate } from "@/types/resume/ResumeTemplate";
import { Settings } from "@/types/resume/Settings";
import { Distribution } from "@/types/resume/Distribution";

const blankSettings: Settings = { fileName: "Blank_Resume", direction: "LTR", pageSize: "A4", showIcons: true, columns: "TWO", sidebar: { position: "LEFT" } };

export default function TemplatesPanel() {
    const { templates, selectedResume, activateTemplate, startBlankDraft, sections } = useResumeBuilder();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [activeSource, setActiveSource] = useState<"OFFICIAL" | "COMMUNITY" | "PRIVATE">("OFFICIAL");
    const [showBlankDialog, setShowBlankDialog] = useState(false);
    const [draftSettings, setDraftSettings] = useState<Settings>(blankSettings);
    const [draftDistribution, setDraftDistribution] = useState<Distribution>({});

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
    const toggleDraftSection = (sectionId: string) => setDraftDistribution((prev) => {
        if (prev[sectionId]) { const next = { ...prev }; delete next[sectionId]; return next; }
        return { ...prev, [sectionId]: { order: Object.keys(prev).length, position: draftSettings.columns === "TWO" ? "left" : "FULL", visible: true, showIcon: true } };
    });
    const createBlankDraft = () => {
        startBlankDraft(draftSettings, draftDistribution);
        setShowBlankDialog(false);
    };

    return (
        <div className="space-y-6">
            <TemplatesFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeSource={activeSource} setActiveSource={setActiveSource} categories={categories} getTemplatesBySource={getTemplatesBySource} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                <div onClick={() => setShowBlankDialog(true)} className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg overflow-hidden transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 border-2 border-dashed border-blue-300">
                    <div className="relative bg-linear-to-br from-blue-100 to-purple-100 aspect-3/4 flex items-center justify-center">
                        <div className="text-center"><div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"><FiPlus className="w-10 h-10 text-white" /></div><h3 className="text-xl font-bold text-gray-900">Start From Scratch</h3><p className="text-gray-600 text-sm mt-2 px-4">Create a completely blank draft</p></div>
                    </div>
                    <div className="p-3 text-center"><h4 className="font-semibold text-blue-600 text-sm">Blank Canvas</h4><p className="text-xs text-gray-500 mt-1">No database save, start fresh</p></div>
                </div>
                {filteredTemplates.map((template) => <ResumeCardWorkspace key={template.id} id={template.id} name={template.name} previewImage={template.previewImage} views={template.views} downloads={template.downloads} likes={template.likes} isSelected={(selectedResume?.id ?? "") === template.id} authorName={template.visibility === "COMMUNITY" ? template.authorId : undefined} onClick={handleSelectTemplate} />)}
            </div>
            {showBlankDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><h3 className="text-xl font-bold">Create a completely blank draft</h3><button onClick={() => setShowBlankDialog(false)}><FiX /></button></div><div className="grid gap-6 p-6 md:grid-cols-2"><div className="space-y-4"><h4 className="font-semibold">Settings</h4><select value={draftSettings.direction} onChange={(e) => setDraftSettings(p => ({ ...p, direction: e.target.value as "LTR" | "RTL" }))} className="w-full rounded border p-2"><option value="LTR">LTR</option><option value="RTL">RTL</option></select><select value={draftSettings.pageSize} onChange={(e) => setDraftSettings(p => ({ ...p, pageSize: e.target.value as "A4" | "LETTER" }))} className="w-full rounded border p-2"><option value="A4">A4</option><option value="LETTER">Letter</option></select><select value={draftSettings.columns} onChange={(e) => { const columns = e.target.value as "ONE" | "TWO"; setDraftSettings(p => ({ ...p, columns })); setDraftDistribution(p => Object.fromEntries(Object.entries(p).map(([id, item]) => [id, { ...item, position: columns === "TWO" ? "left" : "FULL" }])) as Distribution); }} className="w-full rounded border p-2"><option value="ONE">One column</option><option value="TWO">Two columns</option></select>{draftSettings.columns === "TWO" && <select value={draftSettings.sidebar?.position ?? "LEFT"} onChange={(e) => setDraftSettings(p => ({ ...p, sidebar: { position: e.target.value as "LEFT" | "RIGHT" } }))} className="w-full rounded border p-2"><option value="LEFT">Sidebar left</option><option value="RIGHT">Sidebar right</option></select>}<label className="flex gap-2 text-sm"><input type="checkbox" checked={draftSettings.showIcons} onChange={(e) => setDraftSettings(p => ({ ...p, showIcons: e.target.checked }))} /> Show icons</label></div><div><h4 className="mb-3 font-semibold">Distribution</h4><div className="max-h-80 space-y-2 overflow-auto rounded border p-3">{sections.map(section => <button key={section.id} onClick={() => toggleDraftSection(section.id)} className="flex w-full items-center justify-between rounded border p-2 text-left hover:bg-blue-50"><span>{section.name}</span><span className="font-bold text-blue-600">{draftDistribution[section.id] ? "−" : "+"}</span></button>)}</div></div></div><div className="flex justify-end gap-3 border-t p-5"><button onClick={() => setShowBlankDialog(false)} className="rounded bg-gray-200 px-4 py-2">Cancel</button><button onClick={createBlankDraft} className="rounded bg-blue-600 px-5 py-2 text-white">Create</button></div></div></div>}
        </div>
    );
}
