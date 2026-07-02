// D:\cvBuilder\resumebuilder\src\app\sample\page.tsx
"use client";
import { ResumeProvider, useResumeContext } from '@/context/resume/sampleResumeContext';
import { FiRefreshCw, FiSettings, FiLayout } from 'react-icons/fi';
import { useState } from 'react';
import Canava from '@/hooks/Canava/canava';

function ResumeBuilderContent() {
    const {
        sections,
        settings,
        distribution,
        content,
        mode,
        hasSavedData,
        isLoading,
        resetToSample,
        toggleMode,
        updateSettings,
        updateDistributionItem
    } = useResumeContext();

    const [showSettings, setShowSettings] = useState(false);
    const [showDistribution, setShowDistribution] = useState(false);

    const handleColumnsChange = (columns: "ONE" | "TWO") => {
        updateSettings({ columns });
    };

    const handleSidebarPosition = (position: "LEFT" | "RIGHT") => {
        updateSettings({ sidebar: { position } });
    };

    const handleDirection = (direction: "LTR" | "RTL") => {
        updateSettings({ direction });
    };

    const handlePageSize = (pageSize: "A4" | "LETTER") => {
        updateSettings({ pageSize });
    };

    const handleSectionOrder = (sectionId: string, direction: 'up' | 'down') => {
        const sortedIds = Object.keys(distribution).sort((a, b) => {
            return (distribution[a]?.order || 0) - (distribution[b]?.order || 0);
        });

        const currentIndex = sortedIds.indexOf(sectionId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= sortedIds.length) return;

        const otherId = sortedIds[newIndex];
        const otherOrder = distribution[otherId]?.order || 0;
        const currentOrderValue = distribution[sectionId]?.order || 0;

        updateDistributionItem(sectionId, { order: otherOrder });
        updateDistributionItem(otherId, { order: currentOrderValue });
    };

    const handleSectionPosition = (sectionId: string, position: "left" | "right" | "FULL") => {
        updateDistributionItem(sectionId, { position });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            📄 Resume Builder
                            {hasSavedData && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">💾 Saved</span>}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {sections.length} sections • {Object.keys(content).length} content items
                            {mode === 'edit' ? ' • ✏️ Edit Mode' : ' • 👁️ Preview Mode'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                showSettings 
                                    ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FiSettings size={16} />
                            <span className="hidden sm:inline">Settings</span>
                        </button>
                        <button
                            onClick={() => setShowDistribution(!showDistribution)}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                showDistribution 
                                    ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FiLayout size={16} />
                            <span className="hidden sm:inline">Layout</span>
                        </button>
                        <button
                            onClick={toggleMode}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                mode === 'edit' 
                                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {mode === 'edit' ? '✏️ Edit' : '👁️ Preview'}
                        </button>
                        <button
                            onClick={resetToSample}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2"
                            title="Reset"
                        >
                            <FiRefreshCw size={16} />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                    <div className="max-w-7xl mx-auto">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">⚙️ Page Settings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Columns</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleColumnsChange("ONE")}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            settings.columns === "ONE" 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        One
                                    </button>
                                    <button
                                        onClick={() => handleColumnsChange("TWO")}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            settings.columns === "TWO" 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Two
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Sidebar Position</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSidebarPosition("LEFT")}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            settings.sidebar?.position === "LEFT" 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Left
                                    </button>
                                    <button
                                        onClick={() => handleSidebarPosition("RIGHT")}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            settings.sidebar?.position === "RIGHT" 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Right
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Direction</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDirection("LTR")}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            settings.direction === "LTR" 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        LTR
                                    </button>
                                    <button
                                        onClick={() => handleDirection("RTL")}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            settings.direction === "RTL" 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        RTL
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Page Size</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageSize("A4")}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            settings.pageSize === "A4" 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        A4
                                    </button>
                                    <button
                                        onClick={() => handlePageSize("LETTER")}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            settings.pageSize === "LETTER" 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Letter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Distribution Panel */}
            {showDistribution && (
                <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                    <div className="max-w-7xl mx-auto">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">📐 Section Order & Position</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {Object.keys(distribution)
                                .sort((a, b) => (distribution[a]?.order || 0) - (distribution[b]?.order || 0))
                                .map((sectionId) => {
                                    const section = sections.find(s => s.id === sectionId);
                                    const config = distribution[sectionId];
                                    if (!section || !config) return null;
                                    
                                    return (
                                        <div key={sectionId} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium truncate flex-1">
                                                {section.name || sectionId.substring(0, 8)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleSectionOrder(sectionId, 'up')}
                                                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                                    title="Move up"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => handleSectionOrder(sectionId, 'down')}
                                                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                                    title="Move down"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                            <select
                                                value={config.position || "FULL"}
                                                onChange={(e) => handleSectionPosition(sectionId, e.target.value as "left" | "right" | "FULL")}
                                                className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
                                            >
                                                <option value="FULL">Full</option>
                                                <option value="left">Left</option>
                                                <option value="right">Right</option>
                                            </select>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content - Canava بدون toolbar */}
            <div className="max-w-7xl mx-auto p-4">
                <Canava/>
            </div>

            {/* Info Footer */}
            <div className="fixed bottom-4 left-4 text-xs text-gray-400">
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 max-w-xs">
                    <p>💡 Hover over elements to see edit options</p>
                    <p className="mt-0.5">Click on any element to select it</p>
                    <p className="mt-0.5 text-green-600">➕ Add items using the + button</p>
                    <p className="mt-0.5 text-red-600">🗑️ Delete items using the trash button</p>
                </div>
            </div>
        </div>
    );
}

export default function SamplePage() {
    return (
        <ResumeProvider>
            <ResumeBuilderContent />
        </ResumeProvider>
    );
}