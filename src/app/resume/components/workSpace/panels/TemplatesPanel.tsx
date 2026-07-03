import { useMemo, useState } from "react";
import { FiArrowLeft, FiCheck, FiPlus, FiX } from "react-icons/fi";
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
    const [blankStep, setBlankStep] = useState<1 | 2>(1);
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
    const selectedDraftSections = useMemo(() => sections.filter(section => draftDistribution[section.id]).sort((a, b) => (draftDistribution[a.id]?.order ?? 0) - (draftDistribution[b.id]?.order ?? 0)), [draftDistribution, sections]);
    const handleSelectTemplate = (id: string) => {
        const temp = templates.find(e => e.id === id);
        if (temp) activateTemplate(temp);
    };
    const resetBlankDialog = () => {
        setShowBlankDialog(false);
        setBlankStep(1);
    };
    const toggleDraftSection = (sectionId: string) => setDraftDistribution((prev) => {
        if (prev[sectionId]) {
            const next = { ...prev };
            delete next[sectionId];
            return Object.fromEntries(Object.entries(next).sort((a, b) => a[1].order - b[1].order).map(([id, item], index) => [id, { ...item, order: index }])) as Distribution;
        }
        return { ...prev, [sectionId]: { order: Object.keys(prev).length, position: draftSettings.columns === "TWO" ? "left" : "FULL", visible: true, showIcon: true } };
    });
    const updateDraftColumns = (columns: "ONE" | "TWO") => {
        setDraftSettings(p => ({ ...p, columns }));
        setDraftDistribution(p => Object.fromEntries(Object.entries(p).map(([id, item]) => [id, { ...item, position: columns === "TWO" ? "left" : "FULL" }])) as Distribution);
    };
    const updateDraftSectionPosition = (sectionId: string, position: "left" | "right") => setDraftDistribution(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], position } }));
    const createBlankDraft = () => {
        startBlankDraft(draftSettings, draftDistribution);
        resetBlankDialog();
    };

    return (
        <div className="space-y-6">
            <TemplatesFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeSource={activeSource} setActiveSource={setActiveSource} categories={categories} getTemplatesBySource={getTemplatesBySource} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                <div onClick={() => setShowBlankDialog(true)} className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg overflow-hidden transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 border-2 border-dashed border-blue-300">
                    <div className="relative bg-linear-to-br from-blue-100 to-purple-100 aspect-3/4 flex items-center justify-center">
                        <div className="text-center"><div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"><FiPlus className="w-10 h-10 text-white" /></div><h3 className="text-xl font-bold text-gray-900">Start From Scratch</h3><p className="text-gray-600 text-sm mt-2 px-4">Configure settings, then choose section distribution</p></div>
                    </div>
                    <div className="p-3 text-center"><h4 className="font-semibold text-blue-600 text-sm">Blank Canvas</h4><p className="text-xs text-gray-500 mt-1">Uses database sectionId values</p></div>
                </div>
                {filteredTemplates.map((template) => <ResumeCardWorkspace key={template.id} id={template.id} name={template.name} previewImage={template.previewImage} views={template.views} downloads={template.downloads} likes={template.likes} isSelected={(selectedResume?.id ?? "") === template.id} authorName={template.visibility === "COMMUNITY" ? template.authorId : undefined} onClick={handleSelectTemplate} />)}
            </div>
            {showBlankDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-gray-200 p-6"><div><h3 className="text-2xl font-bold text-gray-900">Start From Scratch</h3><p className="mt-1 text-sm text-gray-500">Build a resume draft in two steps.</p></div><button onClick={resetBlankDialog} className="rounded-lg p-2 hover:bg-gray-100"><FiX /></button></div><div className="px-6 pt-6"><div className="mx-auto mb-6 flex max-w-lg items-center justify-between">{["Settings", "Distribution"].map((label, index) => { const current = index + 1; return <div key={label} className="flex-1 text-center"><div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${blankStep > current ? "bg-green-500 text-white" : blankStep === current ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>{blankStep > current ? <FiCheck /> : current}</div><div className="mt-2 text-xs font-medium text-gray-600">{label}</div></div>; })}</div></div><div className="min-h-96 p-6">{blankStep === 1 ? <div className="grid gap-4 md:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium text-gray-700">File name</span><input value={draftSettings.fileName} onChange={(e) => setDraftSettings(p => ({ ...p, fileName: e.target.value }))} className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500" /></label><label className="space-y-2"><span className="text-sm font-medium text-gray-700">Writing direction</span><select value={draftSettings.direction} onChange={(e) => setDraftSettings(p => ({ ...p, direction: e.target.value as "LTR" | "RTL" }))} className="w-full rounded-lg border border-gray-300 p-3"><option value="LTR">LTR</option><option value="RTL">RTL</option></select></label><label className="space-y-2"><span className="text-sm font-medium text-gray-700">Page size</span><select value={draftSettings.pageSize} onChange={(e) => setDraftSettings(p => ({ ...p, pageSize: e.target.value as "A4" | "LETTER" }))} className="w-full rounded-lg border border-gray-300 p-3"><option value="A4">A4</option><option value="LETTER">Letter</option></select></label><label className="space-y-2"><span className="text-sm font-medium text-gray-700">Column layout</span><select value={draftSettings.columns} onChange={(e) => updateDraftColumns(e.target.value as "ONE" | "TWO")} className="w-full rounded-lg border border-gray-300 p-3"><option value="ONE">One column</option><option value="TWO">Two columns</option></select></label>{draftSettings.columns === "TWO" && <label className="space-y-2"><span className="text-sm font-medium text-gray-700">Sidebar position</span><select value={draftSettings.sidebar?.position ?? "LEFT"} onChange={(e) => setDraftSettings(p => ({ ...p, sidebar: { position: e.target.value as "LEFT" | "RIGHT" } }))} className="w-full rounded-lg border border-gray-300 p-3"><option value="LEFT">Sidebar left</option><option value="RIGHT">Sidebar right</option></select></label>}<label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"><input type="checkbox" checked={draftSettings.showIcons} onChange={(e) => setDraftSettings(p => ({ ...p, showIcons: e.target.checked }))} /> <span className="text-sm font-medium text-gray-700">Show section icons</span></label></div> : <div className="grid gap-6 md:grid-cols-[1fr_1fr]"><div><h4 className="mb-3 font-semibold text-gray-900">Sections Gallery</h4><div className="max-h-96 space-y-2 overflow-auto rounded-xl border border-gray-200 p-3">{sections.map(section => <button key={section.id} onClick={() => toggleDraftSection(section.id)} className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${draftDistribution[section.id] ? "border-blue-200 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"}`}><span className="font-medium text-gray-800">{section.name}</span><span className="font-bold text-blue-600">{draftDistribution[section.id] ? "−" : "+"}</span></button>)}</div></div><div><h4 className="mb-3 font-semibold text-gray-900">Selected Distribution</h4><div className="max-h-96 space-y-2 overflow-auto rounded-xl border border-gray-200 p-3">{selectedDraftSections.length === 0 ? <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Choose sections from the gallery. Each item is stored by its database sectionId.</p> : selectedDraftSections.map(section => <div key={section.id} className="rounded-lg border border-gray-200 p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-gray-900">{section.name}</p><p className="text-xs text-gray-400">#{draftDistribution[section.id]?.order + 1} · {section.id}</p></div>{draftSettings.columns === "TWO" && <select value={draftDistribution[section.id]?.position === "right" ? "right" : "left"} onChange={(e) => updateDraftSectionPosition(section.id, e.target.value as "left" | "right")} className="rounded border px-2 py-1 text-xs"><option value="left">Left</option><option value="right">Right</option></select>}</div></div>)}</div></div></div>}</div><div className="flex justify-between gap-3 border-t border-gray-200 p-6"><button onClick={() => blankStep === 1 ? resetBlankDialog() : setBlankStep(1)} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">{blankStep === 2 && <FiArrowLeft />} {blankStep === 1 ? "Cancel" : "Back"}</button>{blankStep === 1 ? <button onClick={() => setBlankStep(2)} className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">Next: Distribution</button> : <button onClick={createBlankDraft} className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">Create Draft</button>}</div></div></div>}
        </div>
    );
}
