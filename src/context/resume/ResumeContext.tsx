"use client";

import { Distribution } from "@/types/resume/Distribution";
import { ResumeTemplate } from "@/types/resume/ResumeTemplate";
import { ResumeStyle } from "@/types/resume/ResumeStyle";
import { Section } from "@/types/resume/Section";
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
    startBlankDraft: (settings: Settings, distribution: Distribution) => void;
    addSectionToDistribution: (sectionId: string) => void;
    removeSectionFromDistribution: (sectionId: string) => void;
    updateDistributionItem: (sectionId: string, patch: Partial<Distribution[string]>) => void;
    updateContent: (sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => void;
};

const ResumeBuilderContext = createContext<ResumeBuilderContextType | null>(null);
type ProviderProps = { children: ReactNode; };

const defaultSettings: Settings = { fileName: "My_Resume", direction: "LTR", pageSize: "A4", showIcons: true, columns: "TWO", sidebar: { position: "LEFT" } };
const defaultStyle: ResumeStyle = { global: {}, selectors: {}, elements: {}, customCSS: "" };
const normalizeDistribution = (distribution: Distribution, settings: Settings) => Object.fromEntries(Object.entries(distribution ?? {}).map(([id, item], index) => [id, { order: item?.order ?? index, position: settings.columns === "TWO" ? item?.position === "right" ? "right" : "left" : "FULL", visible: item?.visible ?? true, showIcon: item?.showIcon ?? true }])) as Distribution;
const templateSettings = (template: ResumeTemplate) => template.settings as Settings;
const templateDistribution = (template: ResumeTemplate, settings: Settings) => normalizeDistribution(template.distribution as Distribution, settings);
const templateContent = (template: ResumeTemplate) => ({ ...(template.content ?? {}) }) as Record<string, Content>;

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
    const setSettings: Dispatch<SetStateAction<Settings>> = useCallback((value) => setSettingsState(prev => typeof value === "function" ? (value as (previous: Settings) => Settings)(prev) : value), []);

    const activateTemplate = useCallback((template: ResumeTemplate) => {
        const nextSettings = templateSettings(template);
        setSelectedResume(template);
        setSettingsState(nextSettings);
        setDistributionState(templateDistribution(template, nextSettings));
        setStyle((template.style as ResumeStyle) ?? defaultStyle);
        setContent(templateContent(template));
        setSelectedNodeId(null);
    }, []);

    const startBlankDraft = useCallback((nextSettings: Settings, nextDistribution: Distribution) => {
        setSelectedResume(null); setSettingsState(nextSettings); setDistributionState(normalizeDistribution(nextDistribution, nextSettings)); setStyle(defaultStyle); setContent({}); setSelectedNodeId(null);
    }, []);

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
                    setDistributionState(templateDistribution(first, nextSettings));
                    setStyle((first.style as ResumeStyle) ?? defaultStyle);
                    setContent(templateContent(first));
                }
            }
        };
        fetchInitialData();
    }, []);

    const addSectionToDistribution = useCallback((sectionId: string) => setDistributionState(prev => prev[sectionId] ? prev : { ...prev, [sectionId]: { order: Object.keys(prev).length, position: settings.columns === "TWO" ? "left" : "FULL", visible: true, showIcon: true } }), [settings.columns]);
    const removeSectionFromDistribution = useCallback((sectionId: string) => setDistributionState(prev => { const next = { ...prev }; delete next[sectionId]; return Object.fromEntries(Object.entries(next).sort((a, b) => a[1].order - b[1].order).map(([id, item], index) => [id, { ...item, order: index }])) as Distribution; }), []);
    const updateDistributionItem = useCallback((sectionId: string, patch: Partial<Distribution[string]>) => setDistributionState(prev => prev[sectionId] ? { ...prev, [sectionId]: { ...prev[sectionId], ...patch } } : prev), []);
    const updateContent = useCallback((_sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => setContent(prev => ({ ...prev, [nodeId]: { id: nodeId, type: prev[nodeId]?.type ?? "text", value, prop: props ?? prev[nodeId]?.prop } })), []);
    const toggleMode = useCallback(() => setMode(prev => { const next = prev === "edit" ? "preview" : "edit"; if (next === "preview") setSelectedNodeId(null); return next; }), []);

    return <ResumeBuilderContext.Provider value={{ selectedResume, setSelectedResume, templates, sections, setSections, content, setContent, distribution, setDistribution, settings, setSettings, style, setStyle, mode, setMode, selectedNodeId, setSelectedNodeId, toggleMode, activateTemplate, startBlankDraft, addSectionToDistribution, removeSectionFromDistribution, updateDistributionItem, updateContent }}>{children}</ResumeBuilderContext.Provider>;
}

export function useResumeBuilder() { const context = useContext(ResumeBuilderContext); if (!context) throw new Error("useResumeBuilder must be used inside ResumeBuilderProvider"); return context; }
