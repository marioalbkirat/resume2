"use client";
import { useMemo, useState } from "react";
import { FiPlus, FiEye, FiEyeOff, FiCopy, FiFolder, FiMinus, FiX } from "react-icons/fi";
import { IoMdMove } from "react-icons/io";
import { toast } from "react-toastify";
import CreateSection from "./CreateSection";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { Section } from "@/types/resume/Section";
import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";

const CURRENT_USER_ID = "cmqzvfuwr0001t9x8hf4jp9n6";
const iconFor = (name: string) => name.toLowerCase().includes("education") ? "🎓" : name.toLowerCase().includes("experience") ? "💼" : name.toLowerCase().includes("skill") ? "⚡" : "📄";

export default function SectionsPanel() {
    const { sections, setSections, distribution, settings, setContent, addSectionToDistribution, removeSectionFromDistribution, updateDistributionItem, setDistribution } = useResumeBuilder();
    const [newSectionName, setNewSectionName] = useState("");
    const [draggedSection, setDraggedSection] = useState<string | null>(null);
    const [showCreateSection, setShowCreateSection] = useState(false);
    const [duplicateSource, setDuplicateSource] = useState<Section | null>(null);
    const [duplicateName, setDuplicateName] = useState("");
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

    const assertUnique = (name: string) => !sections.some(s => s.authorId === CURRENT_USER_ID && s.name.trim().toLowerCase() === name.trim().toLowerCase());
    const openCreate = () => {
        if (!newSectionName.trim()) {
            toast.error("Please enter a section name");
            return;
        }
        if (!assertUnique(newSectionName)) {
            toast.error("You already have a section with this name.");
            return;
        }
        setDuplicateSource(null); setShowCreateSection(true);
    };
    const openDuplicate = (section: Section) => {
        setDuplicateSource(section);
        setDuplicateName(`${section.name} Copy`);
        setShowDuplicateDialog(true);
    };
    const confirmDuplicate = () => {
        const name = duplicateName.trim();
        if (!name) {
            toast.error("Please enter a section name");
            return;
        }
        if (!assertUnique(name)) {
            toast.error("You already have a section with this name.");
            return;
        }
        setDuplicateName(name);
        setShowDuplicateDialog(false);
        setShowCreateSection(true);
    };
    const handleSaved = (section: Section) => { setSections(prev => [section, ...prev]); setContent(prev => ({ ...prev, ...((section.content ?? {}) as Record<string, Content>) })); addSectionToDistribution(section.id); setNewSectionName(""); setDuplicateSource(null); setDuplicateName(""); };
    const gallery = useMemo(() => ({
        OFFICIAL: sections.filter(s => s.visibility === "OFFICIAL" && s.authorId !== CURRENT_USER_ID),
        COMMUNITY: sections.filter(s => s.visibility === "COMMUNITY" && s.authorId !== CURRENT_USER_ID),
        PRIVATE: sections.filter(s => s.authorId === CURRENT_USER_ID),
    }), [sections]);
    const selectedSections = sections.filter(s => distribution[s.id]?.visible !== false && distribution[s.id]).sort((a,b) => (distribution[a.id]?.order ?? 0) - (distribution[b.id]?.order ?? 0));
    const reorder = (targetId: string) => {
        if (!draggedSection || draggedSection === targetId) return;
        const items = [...selectedSections];
        const from = items.findIndex(s => s.id === draggedSection), to = items.findIndex(s => s.id === targetId);
        if (from < 0 || to < 0) return;
        const [moved] = items.splice(from, 1); items.splice(to, 0, moved);
        setDistribution(prev => ({ ...prev, ...Object.fromEntries(items.map((s, i) => [s.id, { ...prev[s.id], order: i }])) }));
        setDraggedSection(null);
    };
    const renderGalleryPanel = (title: string, items: Section[]) => (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiPlus className="w-5 h-5 text-purple-600" />{title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map(section => {
                    const added = !!distribution[section.id];
                    return <button key={section.id} onClick={() => added ? removeSectionFromDistribution(section.id) : addSectionToDistribution(section.id)} className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${added ? "bg-blue-50 border-blue-200" : "hover:border-blue-300 hover:bg-blue-50 border-gray-200"}`}><span className="text-sm text-left flex-1">{section.name}</span>{added ? <FiMinus className="w-4 h-4 text-red-600" /> : <FiPlus className="w-4 h-4 text-blue-600" />}</button>;
                })}
            </div>
        </div>
    );

    return <div className="space-y-6"><div className="bg-white rounded-xl shadow-lg p-6"><h3 className="text-lg font-semibold text-gray-900">Section Manager</h3><p className="text-sm text-gray-600 mt-1">{selectedSections.length} sections in distribution</p></div><div className="bg-white rounded-xl shadow-lg p-6"><h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiPlus className="w-5 h-5 text-blue-600" />Add Custom Section</h3><div className="flex gap-3"><input type="text" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="Enter section name" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /><button onClick={openCreate} disabled={!newSectionName.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Create Section</button></div></div>{renderGalleryPanel("Official Sections Gallery", gallery.OFFICIAL)}{renderGalleryPanel("Community Sections Gallery", gallery.COMMUNITY)}{renderGalleryPanel("Private Sections Gallery", gallery.PRIVATE)}<div className="bg-white rounded-xl shadow-lg overflow-hidden"><div className="px-6 py-4 bg-gray-50 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">Resume Sections</h3><p className="text-sm text-gray-600 mt-1">Drag and drop to reorder sections</p></div><div className="divide-y divide-gray-200">{selectedSections.map(section => { const item = distribution[section.id]; return <div key={section.id} draggable onDragStart={(e) => { setDraggedSection(section.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", section.id); }} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }} onDrop={(e) => { e.preventDefault(); reorder(section.id); }} onDragEnd={() => setDraggedSection(null)} className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-move"><div className="flex items-center gap-4 flex-1"><IoMdMove className="w-5 h-5 text-gray-400" />{item.showIcon && <span className="text-2xl">{iconFor(section.name)}</span>}<div><p className="font-medium text-gray-900">{section.name}</p><p className="text-xs text-gray-500">{section.visibility}</p><p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><FiFolder className="w-3 h-3" />Schema section</p></div></div><div className="flex items-center gap-2">{settings.columns === "TWO" && <div className="grid grid-cols-2 gap-2">
                                {(["left", "right"] as const).map((position) => <button key={position} type="button" onClick={() => updateDistributionItem(section.id, { position })} className={`rounded-lg border-2 px-3 py-2 text-xs font-medium capitalize transition ${item.position === position ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>{position}{item.position === position && <span className="ml-1 text-blue-500">✓</span>}</button>)}
                            </div>}<button onClick={() => updateDistributionItem(section.id, { showIcon: !item.showIcon })} className="p-2 hover:bg-blue-50 rounded-lg" title={item.showIcon ? "Hide Icon" : "Show Icon"}>{item.showIcon ? <FiEye className="w-4 h-4 text-blue-600" /> : <FiEyeOff className="w-4 h-4 text-blue-400" />}</button><button onClick={() => removeSectionFromDistribution(section.id)} className="p-2 hover:bg-green-50 rounded-lg" title="Hide Section"><FiEyeOff className="w-4 h-4 text-green-600" /></button><button onClick={() => openDuplicate(section)} className="p-2 hover:bg-purple-50 rounded-lg" title="Duplicate Section"><FiCopy className="w-4 h-4 text-purple-600" /></button></div></div>})}</div></div>{showDuplicateDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-gray-200 p-5"><div><h3 className="text-lg font-bold text-gray-900">Duplicate Section</h3><p className="mt-1 text-sm text-gray-500">Choose a name for the copied section.</p></div><button onClick={() => { setShowDuplicateDialog(false); setDuplicateSource(null); setDuplicateName(""); }} className="rounded-lg p-2 hover:bg-gray-100"><FiX /></button></div><div className="p-5"><label className="mb-2 block text-sm font-medium text-gray-700">Section name</label><input autoFocus value={duplicateName} onChange={(e) => setDuplicateName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmDuplicate(); }} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" /></div><div className="flex justify-end gap-3 border-t border-gray-200 p-5"><button onClick={() => { setShowDuplicateDialog(false); setDuplicateSource(null); setDuplicateName(""); }} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">Cancel</button><button onClick={confirmDuplicate} className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">Duplicate</button></div></div></div>}<CreateSection key={`${duplicateSource?.id ?? "new"}-${duplicateSource ? duplicateName : newSectionName}`} sectionName={duplicateSource ? duplicateName : newSectionName} initialSchema={duplicateSource?.schema as Schema | undefined} initialContent={duplicateSource?.content as Record<string, Content> | undefined} isOpen={showCreateSection} onClose={() => { setShowCreateSection(false); setDuplicateSource(null); setDuplicateName(""); }} onSave={handleSaved} /></div>;
}
