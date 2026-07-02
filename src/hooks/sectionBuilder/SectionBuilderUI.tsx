// D:\cvBuilder\resumebuilder\src\hooks\sectionBuilder\SectionBuilderUI.tsx
import { useState } from "react";
import { Schema } from "@/types/resume/Section";
import { Content } from "@/types/resume/Content";
import { useSectionBuilder } from "./useSectionBuilder";
import TreeNode from "./TreeNode";
import SectionPreview from "./SectionPreview";
import AIGenerateModal from './componenets/AIGenerateModal';
import { FiCpu } from "react-icons/fi";

interface SectionBuilderUIProps { 
    sectionName: string; 
    schema?: Schema; 
    content?: Record<string, Content>; // تغيير من Content[] إلى Record
    onExport?: (data: { schema: Schema; content: Record<string, Content> }) => void; 
}

export default function SectionBuilderUI({ sectionName, schema, content, onExport }: SectionBuilderUIProps) {
    const [showAIModal, setShowAIModal] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    
    const builder = useSectionBuilder({
        initialSchema: schema,
        initialContent: content,
    });

    const handleAIGenerate = () => {
        setShowAIModal(true);
    };

    // حساب عدد عناصر المحتوى
    const contentCount = Object.keys(builder.getAllContent()).length;

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-linear-to-r from-gray-50 to-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                            🏗️ Section Structure Builder
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                            <span>{sectionName}</span>
                            <span className="text-gray-300">•</span>
                            <span>{contentCount} content items</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onExport?.(builder.exportData())}
                            className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                            <span className="text-base">📋</span>
                            <span className="text-sm font-medium">Export</span>
                        </button>
                        <button
                            onClick={handleAIGenerate}
                            disabled={isAILoading}
                            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiCpu size={18} className={isAILoading ? 'animate-spin' : ''} />
                            <span className="font-medium">
                                {isAILoading ? 'Generating...' : 'AI Generate'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-2 gap-6 h-full max-h-125">
                    <div className="border-r border-gray-200 pr-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">
                                📁 Structure Tree
                            </span>
                            <span className="text-xs text-gray-400">
                                {contentCount} elements
                            </span>
                        </div>
                        <div className="overflow-auto max-h-150">
                            <TreeNode builder={builder} isRoot={true} />
                        </div>
                    </div>
                    <div className="pl-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">
                                👁️ Preview
                            </span>
                            <span className="text-xs text-green-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                Live
                            </span>
                        </div>
                        <div className="overflow-auto max-h-150 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <SectionPreview builder={builder} />
                        </div>
                    </div>
                </div>
            </div>
            {showAIModal && (
                <AIGenerateModal
                    builder={builder}
                    onClose={() => setShowAIModal(false)}
                />
            )}
        </div>
    );
}