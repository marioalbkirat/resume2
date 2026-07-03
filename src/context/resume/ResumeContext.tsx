"use client";

import { Distribution } from "@/types/resume/Distribution";
import { ResumeTemplate } from "@/types/resume/ResumeTemplate";
import { ResumeStyle } from "@/types/resume/ResumeStyle";
import { Schema, Section } from "@/types/resume/Section";
import { Settings } from "@/types/resume/Settings";
import { Content } from "@/types/resume/Content";
import { createContext, useContext, ReactNode, useState, Dispatch, SetStateAction, useEffect, useCallback } from "react";

type BuilderMode = "preview" | "edit";

type ResumeBuilderContextType = {
    setSelectedResume: Dispatch<SetStateAction<ResumeTemplate | null>>;
    selectedResume: ResumeTemplate | null;
    templates: ResumeTemplate[];
    sections: Section[];
    setSections: Dispatch<SetStateAction<Section[]>>;
    content: Record<string, Content>;
    setContent: Dispatch<SetStateAction<Record<string, Content>>>;
    distribution: Distribution;
    settings: Settings;
    style: ResumeStyle;
    mode: BuilderMode;
    selectedNodeId: string | null;
    setDistribution: Dispatch<SetStateAction<Distribution>>;
    setSettings: Dispatch<SetStateAction<Settings>>;
    setStyle: Dispatch<SetStateAction<ResumeStyle>>;
    setMode: Dispatch<SetStateAction<BuilderMode>>;
    setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
    toggleMode: () => void;
    activateTemplate: (template: ResumeTemplate) => void;
    addSectionToDistribution: (sectionId: string) => void;
    removeSectionFromDistribution: (sectionId: string) => void;
    updateDistributionItem: (sectionId: string, patch: Partial<Distribution[string]>) => void;
    updateContent: (sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => void;
    addListItem: (sectionId: string, listNodeId: string) => void;
    deleteListItem: (sectionId: string, listItemId: string) => void;
};

const ResumeBuilderContext = createContext<ResumeBuilderContextType | null>(null);
type ProviderProps = { children: ReactNode; };

const defaultSettings: Settings = { fileName: "My_Resume", direction: "LTR", pageSize: "A4", showIcons: true, columns: "TWO", sidebar: { position: "LEFT" } };
const defaultStyle: ResumeStyle = { global: {}, selectors: {}, elements: {}, customCSS: "" };
const normalizeDistribution = (distribution: Distribution, settings: Settings) => Object.fromEntries(Object.entries(distribution ?? {}).map(([id, item], index) => [id, { order: item?.order ?? index, position: settings.columns === "TWO" ? item?.position === "right" ? "right" : "left" : "FULL", visible: item?.visible ?? true, showIcon: item?.showIcon ?? true }])) as Distribution;
const templateSettings = (template: ResumeTemplate) => ({ ...defaultSettings, ...(template.settings as Partial<Settings>), sidebar: { ...defaultSettings.sidebar, ...((template.settings as Partial<Settings>)?.sidebar ?? {}) } }) as Settings;
const templateDistribution = (template: ResumeTemplate, settings: Settings) => normalizeDistribution(template.distribution as Distribution, settings);
const templateContent = (template: ResumeTemplate) => ({ ...(template.content ?? {}) }) as Record<string, Content>;

const contentKeyFor = (node: Schema) => node.value || node.id;
const makeNodeId = () => `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const cloneListItem = (node: Schema, parentId: string | undefined, content: Record<string, Content>) => {
    const nextContent: Record<string, Content> = {};
    const cloneNode = (current: Schema, nextParentId: string | undefined): Schema => {
        const nextId = makeNodeId();
        const sourceKey = contentKeyFor(current);
        const sourceContent = content[sourceKey];
        if (sourceContent) nextContent[nextId] = { ...sourceContent, id: nextId };
        return {
            ...current,
            id: nextId,
            parentId: nextParentId,
            value: undefined,
            children: (current.children ?? []).map(child => cloneNode(child, nextId)),
        };
    };

    return { node: cloneNode(node, parentId), content: nextContent };
};

const removeContentForNode = (node: Schema, nextContent: Record<string, Content>) => {
    delete nextContent[contentKeyFor(node)];
    (node.children ?? []).forEach(child => removeContentForNode(child, nextContent));
};

const mergeSectionContent = (sections: Section[], distribution: Distribution, currentContent: Record<string, Content>) => {
    const next = { ...currentContent };
    sections.forEach((section) => {
        if (!distribution[section.id]) return;
        Object.entries((section.content ?? {}) as Record<string, Content>).forEach(([key, value]) => {
            if (!next[key]) next[key] = value;
        });
    });
    return next;
};

export function ResumeBuilderProvider({ children }: ProviderProps) {
    const [selectedResume, setSelectedResume] = useState<ResumeTemplate | null>(null);
    const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [content, setContent] = useState<Record<string, Content>>({});
    const [distribution, setDistributionState] = useState<Distribution>({});
    const [settings, setSettingsState] = useState<Settings>(defaultSettings);
    const [style, setStyle] = useState<ResumeStyle>(defaultStyle);
    const [mode, setMode] = useState<BuilderMode>("edit");
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const setDistribution: Dispatch<SetStateAction<Distribution>> = useCallback((value) => setDistributionState(prev => typeof value === "function" ? (value as (previous: Distribution) => Distribution)(prev) : value), []);
    const setSettings: Dispatch<SetStateAction<Settings>> = useCallback((value) => setSettingsState(prev => {
        const next = typeof value === "function" ? (value as (previous: Settings) => Settings)(prev) : value;
        setDistributionState(current => normalizeDistribution(current, next));
        return next;
    }), []);

    const activateTemplate = useCallback((template: ResumeTemplate) => {
        const nextSettings = templateSettings(template);
        setSelectedResume(template);
        setSettingsState(nextSettings);
        const nextDistribution = templateDistribution(template, nextSettings);
        setDistributionState(nextDistribution);
        setStyle((template.style as ResumeStyle) ?? defaultStyle);
        setContent(mergeSectionContent(sections, nextDistribution, templateContent(template)));
        setSelectedNodeId(null);
    }, [sections]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const [templatesResponse, sectionsResponse] = await Promise.all([fetch("/api/admin/templates"), fetch("/api/admin/sections")]);
            const loadedSections = sectionsResponse.ok ? await sectionsResponse.json() as Section[] : [];
            setSections(loadedSections);
            if (templatesResponse.ok) {
                const data = await templatesResponse.json() as ResumeTemplate[];
                setTemplates(data);
                if (data[0]) {
                    const first = data[0];
                    const nextSettings = templateSettings(first);
                    setSelectedResume(first);
                    setSettingsState(nextSettings);
                    const nextDistribution = templateDistribution(first, nextSettings);
                    setDistributionState(nextDistribution);
                    setStyle((first.style as ResumeStyle) ?? defaultStyle);
                    setContent(mergeSectionContent(loadedSections, nextDistribution, templateContent(first)));
                }
            }
        };
        fetchInitialData();
    }, []);

    const addSectionToDistribution = useCallback((sectionId: string) => {
        setDistributionState(prev => {
            if (prev[sectionId]) return prev;
            const next = { ...prev, [sectionId]: { order: Object.keys(prev).length, position: settings.columns === "TWO" ? "left" : "FULL", visible: true, showIcon: true } } as Distribution;
            const section = sections.find(item => item.id === sectionId);
            if (section) setContent(current => mergeSectionContent([section], next, current));
            return next;
        });
    }, [sections, settings.columns]);
    const removeSectionFromDistribution = useCallback((sectionId: string) => setDistributionState(prev => { const next = { ...prev }; delete next[sectionId]; return Object.fromEntries(Object.entries(next).sort((a, b) => a[1].order - b[1].order).map(([id, item], index) => [id, { ...item, order: index }])) as Distribution; }), []);
    const updateDistributionItem = useCallback((sectionId: string, patch: Partial<Distribution[string]>) => setDistributionState(prev => prev[sectionId] ? { ...prev, [sectionId]: { ...prev[sectionId], ...patch } } : prev), []);
    const updateContent = useCallback((_sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => setContent(prev => ({ ...prev, [nodeId]: { id: nodeId, type: prev[nodeId]?.type ?? "text", value, prop: props ?? prev[nodeId]?.prop } })), []);

    const addListItem = useCallback((sectionId: string, listNodeId: string) => {
        let clonedContent: Record<string, Content> = {};
        const nextSections = sections.map(section => {
            if (section.id !== sectionId) return section;

            const appendToList = (node: Schema): Schema => {
                if (node.id === listNodeId && (node.tag === "ul" || node.tag === "ol")) {
                    const firstItem = (node.children ?? []).find(child => child.tag === "li");
                    if (!firstItem) return node;
                    const cloned = cloneListItem(firstItem, node.id, content);
                    clonedContent = { ...clonedContent, ...cloned.content };
                    return { ...node, children: [...(node.children ?? []), cloned.node] };
                }
                return { ...node, children: (node.children ?? []).map(appendToList) };
            };

            return { ...section, schema: appendToList(section.schema) };
        });

        if (!Object.keys(clonedContent).length) return;
        setSections(nextSections);
        setContent(prev => ({ ...prev, ...clonedContent }));
    }, [content, sections]);

    const deleteListItem = useCallback((sectionId: string, listItemId: string) => {
        const removedNodes: Schema[] = [];
        const nextSections = sections.map(section => {
            if (section.id !== sectionId) return section;

            const removeNode = (node: Schema): Schema | null => {
                if (node.id === listItemId && node.tag === "li") {
                    removedNodes.push(node);
                    return null;
                }
                const children = (node.children ?? []).map(removeNode).filter((child): child is Schema => Boolean(child));
                return { ...node, children };
            };

            const schema = removeNode(section.schema);
            return schema ? { ...section, schema } : section;
        });

        if (!removedNodes.length) return;
        setSections(nextSections);
        setContent(prev => {
            const next = { ...prev };
            removedNodes.forEach(node => removeContentForNode(node, next));
            return next;
        });
    }, [sections]);

    const toggleMode = useCallback(() => setMode(prev => { const next = prev === "edit" ? "preview" : "edit"; if (next === "preview") setSelectedNodeId(null); return next; }), []);

    return <ResumeBuilderContext.Provider value={{ selectedResume, setSelectedResume, templates, sections, setSections, content, setContent, distribution, setDistribution, settings, setSettings, style, setStyle, mode, setMode, selectedNodeId, setSelectedNodeId, toggleMode, activateTemplate, addSectionToDistribution, removeSectionFromDistribution, updateDistributionItem, updateContent, addListItem, deleteListItem }}>{children}</ResumeBuilderContext.Provider>;
}

export function useResumeBuilder() { const context = useContext(ResumeBuilderContext); if (!context) throw new Error("useResumeBuilder must be used inside ResumeBuilderProvider"); return context; }
