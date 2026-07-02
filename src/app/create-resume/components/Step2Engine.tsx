import React, { useEffect, useState } from 'react';
import SectionSelector from './SectionSelector';
import VisualPreview from './VisualPreview';
import { Engine } from '../page';
import { Section } from '@/types/resume/Section';
interface Step2EngineProps {
    engine: Engine;
    setEngine: (e: any) => void;
}
export default function Step2Engine({ setEngine, engine }: Step2EngineProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [availableSections, setAvailableSections] = useState<Section[] | null>(null);
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await fetch('/api/admin/sections');
                if (response.ok) {
                    const sections = await response.json();
                    setAvailableSections(sections);
                    
                } else {
                    throw new Error('API returned error');
                }
            } catch (error) {
                console.error('Error fetching sections, using default:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSections();
    }, []);
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-500">Loading sections...</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                        Basic Settings
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Language Direction
                            </label>
                            <select
                                value={engine.settings.direction}
                                onChange={(e) => {
                                    setEngine({
                                        ...engine,
                                        settings: {
                                            ...engine.settings,
                                            direction: e.target.value as "LTR" | "RTL",
                                        },
                                    });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="LTR">LTR</option>
                                <option value="RTL">RTL</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Page Size
                            </label>
                            <select
                                value={engine.settings.pageSize}
                                onChange={(e) => {
                                    setEngine({
                                        ...engine,
                                        settings: {
                                            ...engine.settings,
                                            pageSize: e.target.value as "A4" | "Letter",
                                        },
                                    });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="A4">A4 (210 × 297mm)</option>
                                <option value="Letter">Letter (8.5 × 11in)</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={engine.settings.showIcons}
                                    onChange={(e) => {
                                        setEngine({
                                            ...engine,
                                            settings: {
                                                ...engine.settings,
                                                showIcons: e.target.checked,
                                            },
                                        });
                                    }}
                                    className="w-4 h-4 text-blue-500 rounded"
                                />
                                <span className="text-sm text-gray-700">Show icons in sections</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                        Layout Settings
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Column Layout
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEngine({
                                            ...engine,
                                            layout: {
                                                ...engine.layout,
                                                columns: "ONE"
                                            },
                                        });
                                    }}
                                    className={`p-3 border-2 rounded-lg text-center transition ${engine.layout.columns === "ONE"
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
                                    <span className="text-sm font-medium">Single Column</span>
                                    {engine.layout.columns === "ONE" && (
                                        <div className="text-xs text-blue-500 mt-1">✓ Selected</div>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEngine({
                                            ...engine,
                                            layout: {
                                                ...engine.layout,
                                                columns: "TWO"
                                            },
                                        });
                                    }}
                                    className={`p-3 border-2 rounded-lg text-center transition ${engine.layout.columns === "TWO"
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex gap-1 h-16">
                                        <div className="w-1/3 bg-gray-300 rounded"></div>
                                        <div className="w-2/3 bg-gray-200 rounded"></div>
                                    </div>
                                    <span className="text-sm font-medium">Two Columns</span>
                                    {engine.layout.columns === "TWO" && (
                                        <div className="text-xs text-blue-500 mt-1">✓ Selected</div>
                                    )}
                                </button>
                            </div>
                        </div>
                        {engine.layout.columns === "TWO" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sidebar Position
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEngine({
                                                ...engine,
                                                layout: {
                                                    ...engine.layout,
                                                    sidebar: {
                                                        ...engine.layout.sidebar,
                                                        position: "LEFT",
                                                    }
                                                },
                                            });
                                        }}
                                        className={`p-2 border-2 rounded-lg text-center transition ${engine.layout.sidebar?.position === "LEFT"
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        Left
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEngine({
                                                ...engine,
                                                layout: {
                                                    ...engine.layout,
                                                    sidebar: {
                                                        ...engine.layout.sidebar,
                                                        position: "RIGHT",
                                                    }
                                                },
                                            });
                                        }}
                                        className={`p-2 border-2 rounded-lg text-center transition ${engine.layout.sidebar?.position === "RIGHT"
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        Right
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                        Select & Order Sections
                    </h3>
                    <SectionSelector
                        sections={availableSections}
                        setEngine={setEngine}
                        engine={engine}
                    />
                </div>
            </div>
            <VisualPreview engine={engine} />
        </div >
    );
}