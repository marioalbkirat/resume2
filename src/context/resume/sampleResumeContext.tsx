// D:\cvBuilder\resumebuilder\src\context\resume\sampleResumeContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Section } from '@/types/resume/Section';
import { Settings } from '@/types/resume/Settings';
import { ResumeStyle } from '@/types/resume/ResumeStyle';
import { Distribution, DistributionItem } from '@/types/resume/Distribution';
import { Content } from '@/types/resume/Content';
import { Schema } from '@/types/resume/Schema';
import { sampleSections, sampleSettings, sampleDistribution, sampleContent } from './sampleData';
import { dbService } from '@/services/indexedDB';

interface SampleResumeContextType {
    // State
    sections: Section[];
    settings: Settings;
    style: ResumeStyle;
    distribution: Distribution;
    content: Record<string, Content>;
    mode: 'preview' | 'edit';
    selectedNodeId: string | null;

    // Setters
    setSections: (sections: Section[]) => void;
    setSettings: (settings: Settings) => void;
    setStyle: (style: ResumeStyle) => void;
    setDistribution: (distribution: Distribution) => void;
    setContent: (content: Record<string, Content>) => void;
    setMode: (mode: 'preview' | 'edit') => void;
    setSelectedNodeId: (nodeId: string | null) => void;

    // Update functions
    updateSection: (sectionId: string, updates: Partial<Section>) => void;
    updateContent: (sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => void;
    updateDistributionItem: (sectionId: string, item: Partial<DistributionItem>) => void;
    updateSettings: (settings: Partial<Settings>) => void;
    updateElementStyle: (elementId: string, style: Record<string, string | number>) => void;

    // CRUD operations
    addSection: (section: Section) => void;
    removeSection: (sectionId: string) => void;
    addNode: (sectionId: string, tag: string, type: string, name: string, parentId: string, value?: string, props?: Record<string, string>) => void;
    deleteNode: (sectionId: string, nodeId: string) => void;
    updateNode: (sectionId: string, nodeId: string, tag?: string, name?: string) => void;

    // Mode management
    toggleMode: () => void;

    // Reset
    resetToSample: () => void;

    // Status
    hasSavedData: boolean;
    isLoading: boolean;
}

const SampleResumeContext = createContext<SampleResumeContextType | undefined>(undefined);

export const useSampleResume = () => {
    const context = useContext(SampleResumeContext);
    if (!context) {
        throw new Error('useSampleResume must be used within SampleResumeProvider');
    }
    return context;
};

export const useResumeContext = useSampleResume;

interface SampleResumeProviderProps {
    children: ReactNode;
}

export function SampleResumeProvider({ children }: SampleResumeProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [sections, setSections] = useState<Section[]>([]);
    const [settings, setSettings] = useState<Settings>({
        columns: "ONE",
        direction: "LTR",
        pageSize: "A4",
        showIcons: true,
        fileName: "resume"
    });
    const [style, setStyle] = useState<ResumeStyle>({
        global: {},
        selectors: {},
        elements: {}
    });
    const [distribution, setDistribution] = useState<Distribution>({});
    const [content, setContent] = useState<Record<string, Content>>({});
    const [mode, setMode] = useState<'preview' | 'edit'>('edit');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [hasSavedData, setHasSavedData] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // حفظ البيانات في IndexedDB
    const saveToIndexedDB = useCallback(async (data: {
        sections?: Section[];
        settings?: Settings;
        style?: ResumeStyle;
        distribution?: Distribution;
        content?: Record<string, Content>;
        mode?: 'preview' | 'edit';
    }) => {
        try {
            const currentData = {
                sections: data.sections || sections,
                settings: data.settings || settings,
                style: data.style || style,
                distribution: data.distribution || distribution,
                content: data.content || content,
                mode: data.mode || mode,
                timestamp: new Date().toISOString()
            };

            console.log('💾 Saving to IndexedDB:', currentData);
            await dbService.saveData('resumeData', currentData);
            setHasSavedData(true);
        } catch (error) {
            console.error('Error saving to IndexedDB:', error);
        }
    }, [sections, settings, style, distribution, content, mode]);


    const loadFromIndexedDB = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getData('resumeData');
            console.log('📥 Loading from IndexedDB:', data);
            if (data) {
                if (data.sections) setSections(data.sections);
                if (data.settings) setSettings(data.settings);
                if (data.style) setStyle(data.style);
                if (data.distribution) setDistribution(data.distribution);
                if (data.content) setContent(data.content);
                if (data.mode) setMode(data.mode);
                setHasSavedData(true);
                setIsLoading(false);
                setIsInitialized(true);
                return;
            }
        } catch (error) {
            console.error('Error loading from IndexedDB:', error);
        }
        // No saved data, load sample
        resetToSample();
        setIsLoading(false);
        setIsInitialized(true);
    }, []);

    // تحميل البيانات عند بدء التشغيل
    useEffect(() => {
        loadFromIndexedDB();
    }, []);

    // حفظ البيانات عند التغيير
    useEffect(() => {
        if (isInitialized && !isLoading) {
            saveToIndexedDB({
                sections,
                settings,
                style,
                distribution,
                content,
                mode
            });
        }
    }, [sections, settings, style, distribution, content, mode, isInitialized, isLoading]);

     const resetToSample = useCallback(async () => {
        console.log('🔄 Resetting to sample data');
        setSections(sampleSections);
        setSettings(sampleSettings);
        setDistribution(sampleDistribution);
        setContent(sampleContent);
        setMode('edit');
        setSelectedNodeId(null);
        setStyle({ global: {}, selectors: {}, elements: {} });
        setHasSavedData(false);
        setIsInitialized(true);
        // ✅ حفظ البيانات في IndexedDB
        await saveToIndexedDB({
            sections: sampleSections,
            settings: sampleSettings,
            distribution: sampleDistribution,
            content: sampleContent,
            mode: 'edit'
        });
    }, [saveToIndexedDB]);

    const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
        setSections(prev => prev.map(s =>
            s.id === sectionId ? { ...s, ...updates } : s
        ));
    }, []);

    const updateContent = useCallback((sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => {
        setContent(prev => {
            const existing = prev[nodeId];
            return {
                ...prev,
                [nodeId]: {
                    id: nodeId,
                    type: existing?.type || 'text',
                    value: value,
                    prop: props || existing?.prop || {}
                }
            };
        });
    }, []);

    const updateDistributionItem = useCallback((sectionId: string, item: Partial<DistributionItem>) => {
        setDistribution(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                ...item,
                order: prev[sectionId]?.order ?? 0,
                position: prev[sectionId]?.position ?? "FULL",
                visible: prev[sectionId]?.visible ?? true,
                showIcon: prev[sectionId]?.showIcon ?? true
            }
        }));
    }, []);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    const updateElementStyle = useCallback((elementId: string, newStyle: Record<string, string | number>) => {
        setStyle(prev => ({
            ...prev,
            elements: {
                ...prev.elements,
                [elementId]: { ...prev.elements[elementId], ...newStyle }
            }
        }));
    }, []);

    const addSection = useCallback((section: Section) => {
        setSections(prev => [...prev, section]);
        setDistribution(prev => ({
            ...prev,
            [section.id]: {
                order: Object.keys(prev).length,
                position: "FULL",
                visible: true,
                showIcon: true
            }
        }));
    }, []);

    const removeSection = useCallback((sectionId: string) => {
        setSections(prev => prev.filter(s => s.id !== sectionId));
        const newDistribution = { ...distribution };
        delete newDistribution[sectionId];
        setDistribution(newDistribution);
    }, [distribution]);

    // ✅ إصلاح دالة addNode
    // D:\cvBuilder\resumebuilder\src\context\resume\sampleResumeContext.tsx
    // ... (keep everything else the same, just update the addNode function)

    // ✅ إصلاح دالة addNode
    // D:\cvBuilder\resumebuilder\src\context\resume\sampleResumeContext.tsx
// ... (keep everything else the same, just update the addNode function)

    // ✅ إصلاح دالة addNode
    const addNode = useCallback((sectionId: string, tag: string, type: string, name: string, parentId: string, value?: string, props?: Record<string, string>) => {
        console.log('🟢 addNode called with:', { sectionId, tag, type, name, parentId, value, props });

        // ✅ التحقق من وجود sectionId
        if (!sectionId) {
            console.error('❌ Section ID is undefined or empty');
            return;
        }

        const section = sections.find(s => s.id === sectionId);
        if (!section) {
            console.error('❌ Section not found:', sectionId);
            return;
        }

        // ✅ التحقق من وجود parentId
        if (!parentId) {
            console.error('❌ Parent ID is undefined or empty');
            console.log('🔍 Available nodes:', section.schema.children?.map(c => ({ id: c.id, name: c.name, tag: c.tag })));
            return;
        }

        // ✅ دالة للبحث عن الأب وإضافة العقدة
        const findAndAddNode = (node: Schema, targetId: string): { found: boolean; newNode?: Schema } => {
            // إذا كان هذا هو الأب المطلوب
            if (node.id === targetId) {
                console.log('✅ Found parent node:', node.id, node.name);
                const newNodeId = crypto.randomUUID();
                const newNode: Schema = {
                    id: newNodeId,
                    tag,
                    type,
                    name,
                    selectorGroup: tag,
                    children: []
                };

                return {
                    found: true,
                    newNode: {
                        ...node,
                        children: [...(node.children || []), newNode]
                    }
                };
            }

            // البحث في الأطفال
            if (node.children && node.children.length > 0) {
                for (let i = 0; i < node.children.length; i++) {
                    const result = findAndAddNode(node.children[i], targetId);
                    if (result.found && result.newNode) {
                        const newChildren = [...node.children];
                        newChildren[i] = result.newNode;
                        return {
                            found: true,
                            newNode: {
                                ...node,
                                children: newChildren
                            }
                        };
                    }
                }
            }

            return { found: false };
        };

        // ✅ تنفيذ الإضافة
        const result = findAndAddNode(section.schema, parentId);

        if (result.found && result.newNode) {
            console.log('✅ Node added successfully');
            // تحديث الـ Schema
            updateSection(sectionId, { schema: result.newNode });

            // ✅ إضافة المحتوى - البحث عن العقدة الجديدة
            const findNewNode = (node: Schema): Schema | null => {
                if (node.id === parentId) {
                    // البحث في الأطفال عن العقدة الجديدة
                    const newChild = node.children?.find(c => c.tag === tag && c.name === name);
                    return newChild || null;
                }
                if (node.children) {
                    for (const child of node.children) {
                        const result = findNewNode(child);
                        if (result) return result;
                    }
                }
                return null;
            };

            const newNode = findNewNode(result.newNode);
            if (newNode) {
                setContent(prev => ({
                    ...prev,
                    [newNode.id]: {
                        id: newNode.id,
                        type: type,
                        value: value || '',
                        prop: props || {}
                    }
                }));
                console.log('✅ Content added for node:', newNode.id);
            }
        } else {
            console.error('❌ Parent node not found:', parentId);
            console.log('🔍 Available nodes in schema:', JSON.stringify(section.schema, null, 2));
        }
    }, [sections, updateSection]);

    const deleteNode = useCallback((sectionId: string, nodeId: string) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section) return;

        const deleteNodeFromSchema = (node: Schema): { found: boolean; newNode?: Schema } => {
            if (node.id === nodeId) {
                return { found: true, newNode: undefined };
            }
            if (node.children) {
                const newChildren: Schema[] = [];
                let found = false;
                for (const child of node.children) {
                    const result = deleteNodeFromSchema(child);
                    if (result.found) {
                        found = true;
                        if (result.newNode) {
                            newChildren.push(result.newNode);
                        }
                    } else {
                        newChildren.push(child);
                    }
                }
                if (found) {
                    return {
                        found: true,
                        newNode: {
                            ...node,
                            children: newChildren
                        }
                    };
                }
            }
            return { found: false };
        };

        const result = deleteNodeFromSchema(section.schema);
        if (result.found && result.newNode) {
            updateSection(sectionId, { schema: result.newNode });
            setContent(prev => {
                const newContent = { ...prev };
                delete newContent[nodeId];
                return newContent;
            });
        }
    }, [sections, updateSection]);

    const updateNode = useCallback((sectionId: string, nodeId: string, tag?: string, name?: string) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section) return;

        const updateNodeInSchema = (node: Schema): Schema => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    ...(tag && { tag }),
                    ...(name && { name })
                };
            }
            if (node.children) {
                return {
                    ...node,
                    children: node.children.map(child => updateNodeInSchema(child))
                };
            }
            return node;
        };

        const newSchema = updateNodeInSchema(section.schema);
        updateSection(sectionId, { schema: newSchema });
    }, [sections, updateSection]);

    const toggleMode = useCallback(() => {
        setMode(prev => prev === 'preview' ? 'edit' : 'preview');
        if (mode === 'edit') {
            setSelectedNodeId(null);
        }
    }, [mode]);

    const value: SampleResumeContextType = {
        sections,
        settings,
        style,
        distribution,
        content,
        mode,
        selectedNodeId,
        setSections,
        setSettings,
        setStyle,
        setDistribution,
        setContent,
        setMode,
        setSelectedNodeId,
        updateSection,
        updateContent,
        updateDistributionItem,
        updateSettings,
        updateElementStyle,
        addSection,
        removeSection,
        addNode,
        deleteNode,
        updateNode,
        toggleMode,
        resetToSample,
        hasSavedData,
        isLoading
    };

    return (
        <SampleResumeContext.Provider value={value}>
            {children}
        </SampleResumeContext.Provider>
    );
}

export const ResumeProvider = SampleResumeProvider;