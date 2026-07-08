"use client";

import { Distribution } from "@/types/resume/Distribution";
import { ResumeTemplate } from "@/types/resume/ResumeTemplate";
import { Draft } from "@/types/resume/Draft";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { Schema, Section } from "@/types/resume/Section";
import { Settings } from "@/types/resume/Settings";
import { Content } from "@/types/resume/Content";
import { createContext, useContext, ReactNode, useState, Dispatch, SetStateAction, useEffect, useCallback, useMemo } from "react";

type BuilderMode = "preview" | "edit";

type ResumeBuilderContextType = {
    setSelectedResume: Dispatch<SetStateAction<ResumeTemplate | null>>;
    selectedResume: ResumeTemplate | null;
    templates: ResumeTemplate[];
    setTemplates: Dispatch<SetStateAction<ResumeTemplate[]>>;
    drafts: Draft[];
    activeDraft: Draft | null;
    setDrafts: Dispatch<SetStateAction<Draft[]>>;
    setActiveDraft: Dispatch<SetStateAction<Draft | null>>;
    sections: Section[];
    setSections: Dispatch<SetStateAction<Section[]>>;
    content: Record<string, Content>;
    setContent: Dispatch<SetStateAction<Record<string, Content>>>;
    distribution: Distribution;
    resumeDraftSchema: Record<string, Schema>;
    settings: Settings;
    style: ResumeStyle;
    mode: BuilderMode;
    selectedNodeId: string | null;
    selectedNodeIds: string[];
    pageCount: number;
    setPageCount: Dispatch<SetStateAction<number>>;
    setDistribution: Dispatch<SetStateAction<Distribution>>;
    setSettings: Dispatch<SetStateAction<Settings>>;
    setStyle: Dispatch<SetStateAction<ResumeStyle>>;
    setMode: Dispatch<SetStateAction<BuilderMode>>;
    setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
    setSelectedNodeIds: Dispatch<SetStateAction<string[]>>;
    toggleMode: () => void;
    activateTemplate: (template: ResumeTemplate) => void;
    activateDraft: (draft: Draft) => void;
    addSectionToDistribution: (sectionId: string) => void;
    removeSectionFromDistribution: (sectionId: string) => void;
    updateDistributionItem: (sectionId: string, patch: Partial<Distribution[string]>) => void;
    updateContent: (sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => void;
    addListItem: (sectionId: string, listNodeId: string) => void;
    deleteListItem: (sectionId: string, listItemId: string) => void;
    duplicateListItem: (sectionId: string, listItemId: string) => void;
    moveListItem: (sectionId: string, listItemId: string, direction: "up" | "down") => void;
    deleteDraft: (draftId: string) => Promise<void>;
    deletePrivateTemplate: (templateId: string) => Promise<void>;
};

const ResumeBuilderContext = createContext<ResumeBuilderContextType | null>(null);
type ProviderProps = { children: ReactNode; };

const defaultSettings: Settings = { fileName: "My_Resume", direction: "LTR", pageSize: "A4", showIcons: true, columns: "TWO", sidebar: { position: "LEFT" } };
const defaultStyle: ResumeStyle = { global: { fontFamily: "Arial", fontSize: "14px", lineHeight: 1.5, color: "#111827", backgroundColor: "#ffffff", padding: "40px", margin: "0 auto" }, selectors: {}, elements: {}, customCSS: "" };
const normalizeDistribution = (distribution: Distribution, settings: Settings) => Object.fromEntries(Object.entries(distribution ?? {}).map(([id, item], index) => [id, { order: item?.order ?? index, position: settings.columns === "TWO" ? item?.position === "right" ? "right" : "left" : "FULL", visible: item?.visible ?? true, showIcon: item?.showIcon ?? true }])) as Distribution;
const templateSettings = (template: ResumeTemplate) => ({ ...defaultSettings, ...(template.settings as Partial<Settings>), sidebar: { ...defaultSettings.sidebar, ...((template.settings as Partial<Settings>)?.sidebar ?? {}) } }) as Settings;
const templateDistribution = (template: ResumeTemplate, settings: Settings) => normalizeDistribution(template.distribution as Distribution, settings);
const templateContent = (template: ResumeTemplate) => ({ ...(template.content ?? {}) }) as Record<string, Content>;

const contentKeyFor = (node: Schema) => node.id;
const makeNodeId = () => `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const cloneListItem = (node: Schema, parentId: string | undefined, content: Record<string, Content>, style: ResumeStyle) => {
    const nextContent: Record<string, Content> = {};
    const nextElementStyles: Record<string, StyleObject> = {};
    const cloneNode = (current: Schema, nextParentId: string | undefined): Schema => {
        const nextId = makeNodeId();
        const sourceKey = contentKeyFor(current);
        const sourceContent = content[sourceKey];
        const sourceElementStyle = style.elements[sourceKey];
        if (sourceContent) nextContent[nextId] = { ...sourceContent, id: nextId };
        if (sourceElementStyle) nextElementStyles[nextId] = { ...sourceElementStyle };
        return {
            ...current,
            id: nextId,
            parentId: nextParentId,
            children: (current.children ?? []).map(child => cloneNode(child, nextId)),
        };
    };

    return { node: cloneNode(node, parentId), content: nextContent, elementStyles: nextElementStyles };
};

const removeContentForNode = (node: Schema, nextContent: Record<string, Content>) => {
    delete nextContent[contentKeyFor(node)];
    (node.children ?? []).forEach(child => removeContentForNode(child, nextContent));
};


const applyDraftSchemaToSections = (currentSections: Section[], draftSchema: Record<string, Schema> | undefined) => {
    if (!draftSchema || !Object.keys(draftSchema).length) return currentSections;
    const knownSectionIds = new Set(currentSections.map(section => section.id));
    const updatedSections = currentSections.map(section => draftSchema[section.id] ? { ...section, schema: draftSchema[section.id] } : section);
    const draftOnlySections = Object.entries(draftSchema)
        .filter(([sectionId]) => !knownSectionIds.has(sectionId))
        .map(([sectionId, schema], index) => ({
            id: sectionId,
            name: `Draft section ${index + 1}`,
            target: "RESUME" as const,
            visibility: "PRIVATE" as const,
            authorId: "",
            schema,
            content: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Section));
    return [...updatedSections, ...draftOnlySections];
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
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [activeDraft, setActiveDraft] = useState<Draft | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [content, setContent] = useState<Record<string, Content>>({});
    const [distribution, setDistributionState] = useState<Distribution>({});
    const resumeDraftSchema = useMemo(() => Object.fromEntries(sections.filter(section => distribution[section.id]).map(section => [section.id, section.schema])), [distribution, sections]);
    const [settings, setSettingsState] = useState<Settings>(defaultSettings);
    const [style, setStyle] = useState<ResumeStyle>(defaultStyle);
    const [mode, setMode] = useState<BuilderMode>("edit");
    const [selectedNodeIdState, setSelectedNodeIdState] = useState<string | null>(null);
    const [selectedNodeIds, setSelectedNodeIdsState] = useState<string[]>([]);
    const selectedNodeId = selectedNodeIdState;
    const setSelectedNodeId: Dispatch<SetStateAction<string | null>> = useCallback((value) => {
        setSelectedNodeIdState(previous => {
            const next = typeof value === "function" ? (value as (current: string | null) => string | null)(previous) : value;
            setSelectedNodeIdsState(next ? [next] : []);
            return next;
        });
    }, []);
    const setSelectedNodeIds: Dispatch<SetStateAction<string[]>> = useCallback((value) => {
        setSelectedNodeIdsState(previous => {
            const next = typeof value === "function" ? (value as (current: string[]) => string[])(previous) : value;
            setSelectedNodeIdState(next[0] ?? null);
            return next;
        });
    }, []);
    const [pageCount, setPageCount] = useState(1);

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
        setActiveDraft(null);
        setSelectedNodeIds([]);
    }, [sections, setSelectedNodeIds]);


    const activateDraft = useCallback((draft: Draft) => {
        setActiveDraft(draft);
        const sourceTemplate = templates.find(template => template.id === draft.templateId) ?? null;
        setSelectedResume(sourceTemplate);
        setSettingsState(templateSettings({ ...(sourceTemplate ?? {}), settings: draft.settings } as ResumeTemplate));
        setDistributionState(normalizeDistribution(draft.distribution, draft.settings));
        setStyle(draft.style);
        setSections(currentSections => applyDraftSchemaToSections(currentSections, draft.schema));
        setContent(draft.content);
        setSelectedNodeIds([]);
    }, [templates, setSelectedNodeIds]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const [templatesResponse, sectionsResponse, draftsResponse] = await Promise.all([fetch("/api/admin/templates"), fetch("/api/section"), fetch("/api/resume/resume-draft")]);
            const loadedSections = sectionsResponse.ok ? await sectionsResponse.json() as Section[] : [];
            setSections(loadedSections);
            if (draftsResponse.ok) setDrafts(await draftsResponse.json() as Draft[]);
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
        let clonedElementStyles: Record<string, StyleObject> = {};
        const nextSections = sections.map(section => {
            if (section.id !== sectionId) return section;

            const appendToList = (node: Schema): Schema => {
                if (node.id === listNodeId && (node.tag === "ul" || node.tag === "ol")) {
                    const firstItem = (node.children ?? []).find(child => child.tag === "li");
                    if (!firstItem) return node;
                    const cloned = cloneListItem(firstItem, node.id, content, style);
                    clonedContent = { ...clonedContent, ...cloned.content };
                    clonedElementStyles = { ...clonedElementStyles, ...cloned.elementStyles };
                    return { ...node, children: [...(node.children ?? []), cloned.node] };
                }
                return { ...node, children: (node.children ?? []).map(appendToList) };
            };

            return { ...section, schema: appendToList(section.schema) };
        });

        if (!Object.keys(clonedContent).length) return;
        setSections(nextSections);
        setContent(prev => ({ ...prev, ...clonedContent }));
        if (Object.keys(clonedElementStyles).length) {
            setStyle(prev => ({ ...prev, elements: { ...prev.elements, ...clonedElementStyles } }));
        }
    }, [content, sections, style]);

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

    const duplicateListItem = useCallback((sectionId: string, listItemId: string) => {
        let didDuplicate = false;
        let clonedContent: Record<string, Content> = {};
        let clonedElementStyles: Record<string, StyleObject> = {};
        const nextSections = sections.map(section => {
            if (section.id !== sectionId) return section;

            const duplicateNode = (node: Schema): Schema => {
                const children = node.children ?? [];
                const targetIndex = children.findIndex(child => child.id === listItemId && child.tag === "li");
                if (targetIndex >= 0) {
                    const target = children[targetIndex];
                    const cloned = cloneListItem(target, node.id, content, style);
                    didDuplicate = true;
                    clonedContent = { ...clonedContent, ...cloned.content };
                    clonedElementStyles = { ...clonedElementStyles, ...cloned.elementStyles };
                    return { ...node, children: [...children.slice(0, targetIndex + 1), cloned.node, ...children.slice(targetIndex + 1)] };
                }
                return { ...node, children: children.map(duplicateNode) };
            };

            return { ...section, schema: duplicateNode(section.schema) };
        });

        if (!didDuplicate) return;
        setSections(nextSections);
        if (Object.keys(clonedContent).length) setContent(prev => ({ ...prev, ...clonedContent }));
        if (Object.keys(clonedElementStyles).length) {
            setStyle(prev => ({ ...prev, elements: { ...prev.elements, ...clonedElementStyles } }));
        }
    }, [content, sections, style]);

    const moveListItem = useCallback((sectionId: string, listItemId: string, direction: "up" | "down") => {
        let didMove = false;
        const nextSections = sections.map(section => {
            if (section.id !== sectionId) return section;

            const moveNode = (node: Schema): Schema => {
                const children = node.children ?? [];
                const targetIndex = children.findIndex(child => child.id === listItemId && child.tag === "li");
                if (targetIndex >= 0) {
                    const nextIndex = direction === "up" ? targetIndex - 1 : targetIndex + 1;
                    if (nextIndex < 0 || nextIndex >= children.length) return node;
                    const reordered = [...children];
                    [reordered[targetIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[targetIndex]];
                    didMove = true;
                    return { ...node, children: reordered };
                }
                return { ...node, children: children.map(moveNode) };
            };

            return { ...section, schema: moveNode(section.schema) };
        });

        if (didMove) setSections(nextSections);
    }, [sections]);


    const deleteDraft = useCallback(async (draftId: string) => {
        const response = await fetch("/api/resume/resume-draft", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: draftId }),
        });
        if (!response.ok) throw new Error("Failed to delete draft");
        setDrafts(previous => previous.filter(draft => draft.id !== draftId));
        setActiveDraft(previous => previous?.id === draftId ? null : previous);
    }, []);

    const deletePrivateTemplate = useCallback(async (templateId: string) => {
        const response = await fetch("/api/resume/resume-template", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: templateId }),
        });
        if (!response.ok) throw new Error("Failed to delete private template");
        setTemplates(previous => previous.filter(template => template.id !== templateId));
        setSelectedResume(previous => previous?.id === templateId ? null : previous);
    }, []);

    const toggleMode = useCallback(() => setMode(prev => { const next = prev === "edit" ? "preview" : "edit"; if (next === "preview") setSelectedNodeIds([]); return next; }), [setSelectedNodeIds]);

    return <ResumeBuilderContext.Provider value={{ selectedResume, setSelectedResume, templates, setTemplates, drafts, activeDraft, setDrafts, setActiveDraft, sections, setSections, content, setContent, distribution, resumeDraftSchema, setDistribution, settings, setSettings, style, setStyle, mode, setMode, selectedNodeId, selectedNodeIds, setSelectedNodeId, setSelectedNodeIds, pageCount, setPageCount, toggleMode, activateTemplate, activateDraft, addSectionToDistribution, removeSectionFromDistribution, updateDistributionItem, updateContent, addListItem, deleteListItem, duplicateListItem, moveListItem, deleteDraft, deletePrivateTemplate }}>{children}</ResumeBuilderContext.Provider>;
}

export function useResumeBuilder() { const context = useContext(ResumeBuilderContext); if (!context) throw new Error("useResumeBuilder must be used inside ResumeBuilderProvider"); return context; }
