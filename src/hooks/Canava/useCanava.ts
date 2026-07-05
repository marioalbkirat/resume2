// D:\cvBuilder\resumebuilder\src\hooks\Canava\useCanava.ts
import { useState, useCallback, useMemo } from 'react';
import { Section } from '@/types/resume/Section';
import { Settings } from '@/types/resume/Settings';
import { ResumeStyle } from '@/types/resume/ResumeStyle';
import { Distribution, DistributionItem } from '@/types/resume/Distribution';
import { Content } from '@/types/resume/Content';
import { SectionSchema } from '@/classes/section/SectionSchema';
import { SectionContent } from '@/classes/section/SectionContent';

export interface CanavaState {
    sections: Section[];
    settings: Settings;
    style: ResumeStyle;
    distribution: Distribution;
    mode: 'preview' | 'edit';
    selectedNodeId: string | null;
    content: Record<string, Content>;
}

export interface UseCanavaProps {
    initialSections?: Section[];
    initialSettings?: Settings;
    initialStyle?: ResumeStyle;
    initialDistribution?: Distribution;
    initialMode?: 'preview' | 'edit';
    initialContent?: Record<string, Content>;
    onUpdate?: (state: Partial<CanavaState>) => void;
}

export interface UseCanavaReturn {
    state: CanavaState;
    // Section Management
    addSection: (section: Section) => void;
    removeSection: (sectionId: string) => void;
    updateSection: (sectionId: string, updates: Partial<Section>) => void;
    
    // Schema Management
    addNode: (sectionId: string, tag: string, type: string, name: string, parentId: string, value?: string, props?: Record<string, string>) => void;
    deleteNode: (sectionId: string, nodeId: string) => void;
    updateNode: (sectionId: string, nodeId: string, tag?: string, name?: string) => void;
    
    // Content Management
    updateContent: (sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => void;
    getContent: (sectionId: string, nodeId: string) => Content | null;
    getAllContent: (sectionId: string) => Record<string, Content>;
    
    // Settings Management
    updateSettings: (settings: Partial<Settings>) => void;
    updateDistribution: (distribution: Partial<Distribution>) => void;
    updateDistributionItem: (sectionId: string, item: Partial<DistributionItem>) => void;
    
    // Style Management
    updateStyle: (style: Partial<ResumeStyle>) => void;
    updateElementStyle: (elementId: string, style: Record<string, string | number>) => void;
    
    // Mode Management
    toggleMode: () => void;
    setMode: (mode: 'preview' | 'edit') => void;
    selectNode: (nodeId: string | null) => void;
    
    // Export
    exportData: () => CanavaState;
    resetState: (state: Partial<CanavaState>) => void;
}

export function useCanava({
    initialSections = [],
    initialSettings = {
        columns: "ONE",
        direction: "LTR",
        pageSize: "A4",
        showIcons: true,
        fileName: "resume"
    },
    initialStyle = { global: {}, selectors: {}, elements: {} },
    initialDistribution = {},
    initialMode = 'edit',
    initialContent = {},
    onUpdate
}: UseCanavaProps = {}): UseCanavaReturn {
    
    const [sections, setSections] = useState<Section[]>(initialSections);
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const [style, setStyle] = useState<ResumeStyle>(initialStyle);
    const [distribution, setDistribution] = useState<Distribution>(initialDistribution);
    const [mode, setModeState] = useState<'preview' | 'edit'>(initialMode);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [content, setContent] = useState<Record<string, Content>>(initialContent);

    const schemaControl = useMemo(() => new SectionSchema(), []);
    const contentControl = useMemo(() => new SectionContent(), []);

    // Helper function to notify parent of changes
    const notifyUpdate = useCallback((updates: Partial<CanavaState>) => {
        if (onUpdate) {
            onUpdate(updates);
        }
    }, [onUpdate]);

    // Find section by ID
    const findSection = useCallback((sectionId: string) => {
        return sections.find(s => s.id === sectionId);
    }, [sections]);

    // Update section in array
    const updateSectionInArray = useCallback((sectionId: string, updates: Partial<Section>) => {
        setSections(prev => prev.map(s => 
            s.id === sectionId ? { ...s, ...updates } : s
        ));
    }, []);

    // Section Management
    const addSection = useCallback((section: Section) => {
        setSections(prev => [...prev, section]);
        // Auto-add to distribution
        setDistribution(prev => ({
            ...prev,
            [section.id]: {
                order: Object.keys(prev).length,
                position: "FULL",
                visible: true,
                showIcon: true
            }
        }));
        notifyUpdate({ sections: [...sections, section] });
    }, [sections, notifyUpdate]);

    const removeSection = useCallback((sectionId: string) => {
        setSections(prev => prev.filter(s => s.id !== sectionId));
        // Remove from distribution
        const newDistribution = { ...distribution };
        delete newDistribution[sectionId];
        setDistribution(newDistribution);
        notifyUpdate({ 
            sections: sections.filter(s => s.id !== sectionId),
            distribution: newDistribution 
        });
    }, [sections, distribution, notifyUpdate]);

    const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
        updateSectionInArray(sectionId, updates);
        notifyUpdate({ sections: sections.map(s => 
            s.id === sectionId ? { ...s, ...updates } : s
        )});
    }, [sections, updateSectionInArray, notifyUpdate]);

    // Schema Management
    const addNode = useCallback((sectionId: string, tag: string, type: string, name: string, parentId: string, value?: string, props?: Record<string, string>) => {
        const section = findSection(sectionId);
        if (!section) return;

        const schemaCopy = JSON.parse(JSON.stringify(section.schema));
        const result = schemaControl.addNode(schemaCopy, tag, parentId);
        if (!result) return;

        const { section: newSchema, child } = result;
        
        // Update section with new schema
        updateSectionInArray(sectionId, { schema: newSchema });
        
        // Update content
        setContent(prevContent => {
            const existingContent = contentControl.getContent(prevContent, child.id);
            if (!existingContent) {
                const defaultContent = contentControl.getDefaultContent(type);
                return contentControl.createContent(
                    prevContent,
                    child.id,
                    tag,
                    type,
                    value || defaultContent.value,
                    props || defaultContent.props
                );
            }
            return prevContent;
        });

        notifyUpdate({
            sections: sections.map(s => s.id === sectionId ? { ...s, schema: newSchema } : s),
            content: content
        });
    }, [findSection, schemaControl, contentControl, sections, updateSectionInArray, content, notifyUpdate]);

    const deleteNode = useCallback((sectionId: string, nodeId: string) => {
        const section = findSection(sectionId);
        if (!section) return;

        const schemaCopy = JSON.parse(JSON.stringify(section.schema));
        const result = schemaControl.deleteNode(schemaCopy, nodeId);
        if (!result) return;

        // Update section
        updateSectionInArray(sectionId, { schema: result });
        
        // Delete content
        setContent(prevContent => contentControl.deleteContent(prevContent, nodeId));

        notifyUpdate({
            sections: sections.map(s => s.id === sectionId ? { ...s, schema: result } : s),
            content: content
        });
    }, [findSection, schemaControl, contentControl, sections, updateSectionInArray, content, notifyUpdate]);

    const updateNode = useCallback((sectionId: string, nodeId: string, tag?: string, name?: string) => {
        const section = findSection(sectionId);
        if (!section) return;

        const schemaCopy = JSON.parse(JSON.stringify(section.schema));
        const result = schemaControl.updateNode(schemaCopy, nodeId, tag);
        if (!result) return;

        updateSectionInArray(sectionId, { schema: result });
        notifyUpdate({
            sections: sections.map(s => s.id === sectionId ? { ...s, schema: result } : s)
        });
    }, [findSection, schemaControl, sections, updateSectionInArray, notifyUpdate]);

    // Content Management
    const updateContent = useCallback((sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => {
        setContent(prevContent => {
            let updated = prevContent;
            const existing = contentControl.getContent(prevContent, nodeId);
            
            if (existing) {
                if (value !== undefined) {
                    updated = contentControl.updateContentValue(updated, nodeId, existing.type === "heading" ? "h2" : existing.type === "paragraph" ? "p" : "span", value);
                }
                if (props) {
                    updated = contentControl.updateContentProps(updated, nodeId, props);
                }
            } else {
                const section = findSection(sectionId);
                if (section) {
                    const node = schemaControl.getNode(section.schema, nodeId);
                    if (node) {
                        const defaultContent = contentControl.getDefaultContent(node.type);
                        updated = contentControl.createContent(
                            updated,
                            nodeId,
                            node.tag,
                            node.type,
                            value || defaultContent.value,
                            props || defaultContent.props
                        );
                    }
                }
            }
            return updated;
        });
        notifyUpdate({ content });
    }, [contentControl, findSection, schemaControl, content, notifyUpdate]);

    const getContent = useCallback((_sectionId: string, nodeId: string) => {
        return contentControl.getContent(content, nodeId);
    }, [content, contentControl]);

    const getAllContent = useCallback((sectionId: string) => {
        void sectionId;
        return content;
    }, [content]);

    // Settings Management
    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        notifyUpdate({ settings: { ...settings, ...newSettings } });
    }, [settings, notifyUpdate]);

    const updateDistribution = useCallback((newDistribution: Partial<Distribution>) => {
        setDistribution(prev => ({ ...prev, ...newDistribution }));
        notifyUpdate({ distribution: { ...distribution, ...newDistribution } });
    }, [distribution, notifyUpdate]);

    const updateDistributionItem = useCallback((sectionId: string, item: Partial<DistributionItem>) => {
        const fallback: DistributionItem = { order: 0, position: settings.columns === "TWO" ? "left" : "FULL", visible: true, showIcon: true };
        setDistribution(prev => ({
            ...prev,
            [sectionId]: { ...(prev[sectionId] || fallback), ...item }
        }));
        notifyUpdate({
            distribution: {
                ...distribution,
                [sectionId]: { ...(distribution[sectionId] || fallback), ...item }
            }
        });
    }, [distribution, notifyUpdate, settings.columns]);

    // Style Management
    const updateStyle = useCallback((newStyle: Partial<ResumeStyle>) => {
        setStyle(prev => ({ ...prev, ...newStyle }));
        notifyUpdate({ style: { ...style, ...newStyle } });
    }, [style, notifyUpdate]);

    const updateElementStyle = useCallback((elementId: string, newStyle: Record<string, string | number>) => {
        setStyle(prev => ({
            ...prev,
            elements: {
                ...prev.elements,
                [elementId]: { ...prev.elements[elementId], ...newStyle }
            }
        }));
        notifyUpdate({
            style: {
                ...style,
                elements: {
                    ...style.elements,
                    [elementId]: { ...style.elements[elementId], ...newStyle }
                }
            }
        });
    }, [style, notifyUpdate]);

    // Mode Management
    const toggleMode = useCallback(() => {
        const newMode = mode === 'preview' ? 'edit' : 'preview';
        setModeState(newMode);
        if (newMode === 'preview') {
            setSelectedNodeId(null);
        }
        notifyUpdate({ mode: newMode, selectedNodeId: null });
    }, [mode, notifyUpdate]);

    const setMode = useCallback((newMode: 'preview' | 'edit') => {
        setModeState(newMode);
        if (newMode === 'preview') {
            setSelectedNodeId(null);
        }
        notifyUpdate({ mode: newMode, selectedNodeId: null });
    }, [notifyUpdate]);

    const selectNode = useCallback((nodeId: string | null) => {
        if (mode === 'preview') return;
        setSelectedNodeId(nodeId);
        notifyUpdate({ selectedNodeId: nodeId });
    }, [mode, notifyUpdate]);

    // Export
    const exportData = useCallback(() => {
        return {
            sections,
            settings,
            style,
            distribution,
            mode,
            selectedNodeId,
            content
        };
    }, [sections, settings, style, distribution, mode, selectedNodeId, content]);

    const resetState = useCallback((newState: Partial<CanavaState>) => {
        if (newState.sections) setSections(newState.sections);
        if (newState.settings) setSettings(newState.settings);
        if (newState.style) setStyle(newState.style);
        if (newState.distribution) setDistribution(newState.distribution);
        if (newState.mode !== undefined) setModeState(newState.mode);
        if (newState.selectedNodeId !== undefined) setSelectedNodeId(newState.selectedNodeId);
        if (newState.content) setContent(newState.content);
    }, []);

    return {
        state: {
            sections,
            settings,
            style,
            distribution,
            mode,
            selectedNodeId,
            content
        },
        addSection,
        removeSection,
        updateSection,
        addNode,
        deleteNode,
        updateNode,
        updateContent,
        getContent,
        getAllContent,
        updateSettings,
        updateDistribution,
        updateDistributionItem,
        updateStyle,
        updateElementStyle,
        toggleMode,
        setMode,
        selectNode,
        exportData,
        resetState
    };
}