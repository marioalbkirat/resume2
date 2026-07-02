"use client";

import { Distribution } from "@/types/resume/Distribution";
import { ResumeTemplate } from "@/types/resume/ResumeTemplate";
import { Section } from "@/types/resume/Section";
import { Settings } from "@/types/resume/Settings";
import { Content } from "@/types/resume/Content";
import { createContext, useContext, ReactNode, useState, Dispatch, SetStateAction, useEffect, useCallback } from "react";

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
    setDistribution: Dispatch<SetStateAction<Distribution>>;
    setSettings: Dispatch<SetStateAction<Settings>>;
    activateTemplate: (template: ResumeTemplate) => void;
    startBlankDraft: (settings: Settings, distribution: Distribution) => void;
    addSectionToDistribution: (sectionId: string) => void;
    removeSectionFromDistribution: (sectionId: string) => void;
    updateDistributionItem: (sectionId: string, patch: Partial<Distribution[string]>) => void;
};

const ResumeBuilderContext = createContext<ResumeBuilderContextType | null>(null);
type ProviderProps = { children: ReactNode; };

const defaultSettings: Settings = {
    fileName: "My_Resume",
    direction: "LTR",
    pageSize: "A4",
    showIcons: true,
    columns: "TWO",
    sidebar: { position: "LEFT" }
};

export function ResumeBuilderProvider({ children }: ProviderProps) {
    const [selectedResume, setSelectedResume] = useState<ResumeTemplate | null>(null);
    const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [content, setContent] = useState<Record<string, Content>>({});
    const [distribution, setDistribution] = useState<Distribution>({});
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    const activateTemplate = useCallback((template: ResumeTemplate) => {
        setSelectedResume(template);
        setSettings((template.settings as Settings) ?? defaultSettings);
        setDistribution((template.distribution as Distribution) ?? {});
        setContent(template.content ?? {});
    }, []);

    const startBlankDraft = useCallback((nextSettings: Settings, nextDistribution: Distribution) => {
        setSelectedResume(null);
        setSettings(nextSettings);
        setDistribution(nextDistribution);
        setContent({});
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            const [templatesResponse, sectionsResponse] = await Promise.all([
                fetch("/api/admin/templates"),
                fetch("/api/admin/sections"),
            ]);
            const loadedSections = sectionsResponse.ok ? await sectionsResponse.json() as Section[] : [];
            setSections(loadedSections);
            if (templatesResponse.ok) {
                const data = await templatesResponse.json() as ResumeTemplate[];
                setTemplates(data);
                if (data[0]) activateTemplate(data[0]);
            }
        };
        fetchInitialData();
    }, [activateTemplate]);


    const addSectionToDistribution = useCallback((sectionId: string) => {
        setDistribution((prev) => {
            if (prev[sectionId]) return prev;
            const order = Object.keys(prev).length;
            return { ...prev, [sectionId]: { order, position: settings.columns === "TWO" ? "left" : "FULL", visible: true, showIcon: true } };
        });
    }, [settings.columns]);

    const removeSectionFromDistribution = useCallback((sectionId: string) => {
        setDistribution((prev) => {
            const next = { ...prev };
            delete next[sectionId];
            return Object.fromEntries(Object.entries(next).sort((a, b) => a[1].order - b[1].order).map(([id, item], index) => [id, { ...item, order: index }])) as Distribution;
        });
    }, []);

    const updateDistributionItem = useCallback((sectionId: string, patch: Partial<Distribution[string]>) => {
        setDistribution((prev) => prev[sectionId] ? { ...prev, [sectionId]: { ...prev[sectionId], ...patch } } : prev);
    }, []);

    return <ResumeBuilderContext.Provider value={{ selectedResume, setSelectedResume, templates, sections, setSections, content, setContent, distribution, setDistribution, settings, setSettings, activateTemplate, startBlankDraft, addSectionToDistribution, removeSectionFromDistribution, updateDistributionItem }}>{children}</ResumeBuilderContext.Provider>;
}

export function useResumeBuilder() {
    const context = useContext(ResumeBuilderContext);
    if (!context) throw new Error("useResumeBuilder must be used inside ResumeBuilderProvider");
    return context;
}
