import { useState } from "react";
import { Schema } from "@/types/resume/Section";
import { Content } from "@/types/resume/Content";
import { useSectionBuilder } from "./useSectionBuilder";
import TreeNode from "./TreeNode";
import SectionPreview from "./SectionPreview";
import AIGenerateModal from './componenets/AIGenerateModal';
import { FiCpu, FiSliders } from "react-icons/fi";

interface SectionBuilderUIProps { 
    sectionName: string; 
    schema?: Schema; 
    content?: Record<string, Content>;
    onExport?: (data: { schema: Schema; content: Record<string, Content> }) => void; 
}

export default function SectionBuilderUI({ sectionName, schema, content, onExport }: SectionBuilderUIProps) {
    const [showAIModal, setShowAIModal] = useState(!schema?.children?.length);
    const [advancedMode, setAdvancedMode] = useState(Boolean(schema?.children?.length));
    const builder = useSectionBuilder({ initialSchema: schema ? { ...schema, name: sectionName } : undefined, initialContent: content, sectionName });
    const contentCount = Object.keys(builder.getAllContent()).length;

    const exportCurrent = () => onExport?.({ ...builder.exportData(), schema: { ...builder.exportData().schema, name: sectionName } });

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-linear-to-r from-purple-50 to-white px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-800 text-lg">✨ Smart Section Builder</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Start with AI in plain language, then use Advanced edit only when you need precise control.</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1"><span>{sectionName}</span><span className="text-gray-300">•</span><span>{contentCount} fields</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={exportCurrent} className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">Use current draft</button>
                        <button onClick={() => setShowAIModal(true)} className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg"><FiCpu size={18} />AI generate</button>
                        <button onClick={() => setAdvancedMode(prev => !prev)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"><FiSliders size={18} />{advancedMode ? "Hide advanced" : "Advanced generate/edit"}</button>
                    </div>
                </div>
            </div>
            {advancedMode ? <div className="p-4"><div className="grid grid-cols-2 gap-6 h-full max-h-125"><div className="border-r border-gray-200 pr-6"><div className="flex items-center justify-between mb-3"><span className="text-sm font-medium text-gray-600">📁 Structure Tree</span><span className="text-xs text-gray-400">{contentCount} elements</span></div><div className="overflow-auto max-h-150"><TreeNode builder={builder} isRoot={true} /></div></div><div className="pl-6"><div className="flex items-center justify-between mb-3"><span className="text-sm font-medium text-gray-600">👁️ Preview</span><span className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Live</span></div><div className="overflow-auto max-h-150 p-4 bg-gray-50 rounded-lg border border-gray-200"><SectionPreview builder={builder} /></div></div></div></div> : <div className="p-8 text-center text-gray-600"><p className="text-lg font-medium text-gray-800">Describe the section you want.</p><p className="mt-2">Example: “Languages section with language name and proficiency level.”</p><button onClick={() => setShowAIModal(true)} className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg"><FiCpu />Open AI generator</button></div>}
            {showAIModal && <AIGenerateModal builder={builder} sectionName={sectionName} onGenerated={() => { setAdvancedMode(true); exportCurrent(); }} onClose={() => setShowAIModal(false)} />}
        </div>
    );
}
