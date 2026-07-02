import { useState, useEffect, useCallback, useMemo } from 'react';
import { Engine } from '../page';
import { SectionStyle } from '@/types/resume/SectionStyle';
import { Section } from '@/types/resume/Section';
import BuildLayout from '@/hooks/Canava/BuildLayout';
import { useStyleEditor } from '@/hooks/Style/useStyleEditor';
import FloatingStyleToolbar from '@/hooks/Style/components/FloatingStyleToolbar';
interface StepStyleProps { engine: Engine; style: SectionStyle[] | null; setStyle: (style: SectionStyle[]) => void; }
export default function StepStyle({ engine, style, setStyle }: StepStyleProps) {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAIModal, setShowAIModal] = useState<boolean>(false);
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
    const { state, actions } = useStyleEditor(engine, sections, style || []);
    const { nodeStyles, selectedNodeId, applyToAllSameTag, version, loading: styleLoading } = state;
    const { selectNode, updateNodeStyle, applyPresetToNode, resetNodeStyle, getSelectedNode, setApplyToAll, generateAIStyle, } = actions;
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await fetch('/api/admin/sections');
                if (response.ok) {
                    const data = await response.json();
                    setSections(data);
                } else {
                    throw new Error('API returned error');
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSections();
    }, []);
    const getSelectedSections = useCallback((): Section[] => {
        if (!sections.length) return [];
        const distribution = engine.layout.distribution || {};
        const selectedNames = Object.keys(distribution);
        return sections.filter(section =>
            selectedNames.includes(section.name) &&
            distribution[section.name]?.visible !== false
        ).sort((a, b) => {
            const orderA = distribution[a.name]?.order ?? Infinity;
            const orderB = distribution[b.name]?.order ?? Infinity;
            return orderA - orderB;
        });
    }, [sections, engine.layout.distribution]);
    const selectedSections = useMemo(() => getSelectedSections(), [getSelectedSections]);
    const selectedStyleNode = getSelectedNode();
    const handleElementClick = (nodeId: string) => {
        selectNode(nodeId);
    };
    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) {
            alert('Please describe the style you want');
            return;
        }
        setIsGeneratingAI(true);
        try {
            const success = await generateAIStyle(aiPrompt);
            if (success) {
                setShowAIModal(false);
                setAiPrompt('');
            } else {
                alert('Failed to generate styles. Please try again.');
            }
        } catch (error) {
            console.error('Error generating AI styles:', error);
            alert('Failed to generate styles. Please try again.');
        } finally {
            setIsGeneratingAI(false);
        }
    };
    if (loading || styleLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading sections...</p>
                </div>
            </div>
        );
    }
    if (!selectedSections.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-500">No sections selected. Please go back to Step 2 and select sections.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="h-[calc(100vh-300px)] min-h-150 relative">
            <div className="w-full h-full bg-gray-50 overflow-y-auto p-4">
                <div className="bg-white shadow-lg rounded-lg p-6 flex justify-center min-h-full">
                    {nodeStyles.length > 0 ? (
                        <BuildLayout
                            key={`style-${version}`}
                            layout={engine.layout}
                            sections={selectedSections}
                            style={nodeStyles}
                            onElementClick={handleElementClick}
                            selectedNodeId={selectedNodeId}
                        />
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <p>Loading styles...</p>
                        </div>
                    )}
                </div>
            </div>
            <FloatingStyleToolbar
                selectedNode={selectedStyleNode}
                applyToAllSameTag={applyToAllSameTag}
                onApplyToAllChange={setApplyToAll}
                onUpdateStyle={updateNodeStyle}
                onApplyPreset={applyPresetToNode}
                onResetStyle={resetNodeStyle}
                onAIClick={() => setShowAIModal(true)}
            />
            {showAIModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                🤖 AI Style Generator
                            </h3>
                            <button
                                onClick={() => setShowAIModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Describe your desired style
                                </label>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Example: Create a modern, minimalist design with blue tones, clean typography, and subtle shadows."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-30 resize-y"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAIGenerate}
                                    disabled={isGeneratingAI || !aiPrompt.trim()}
                                    className="flex-1 py-2 bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isGeneratingAI ? (
                                        <>
                                            <span className="animate-spin">⟳</span>
                                            Generating...
                                        </>
                                    ) : (
                                        '✨ Generate Styles'
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowAIModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="text-xs text-gray-500">
                                <p className="font-medium">💡 Tips for best results:</p>
                                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                    <li>Describe the overall mood (professional, modern, elegant, etc.)</li>
                                    <li>Mention colors you prefer (blue, minimal, warm, etc.)</li>
                                    <li>Specify the style (clean, bold, minimalist, etc.)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}