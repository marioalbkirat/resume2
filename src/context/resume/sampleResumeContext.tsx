"use client";

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Content } from "@/types/resume/Content";
import { Distribution, DistributionItem } from "@/types/resume/Distribution";
import { ResumeStyle } from "@/types/resume/ResumeStyle";
import { Schema, Section } from "@/types/resume/Section";
import { Settings } from "@/types/resume/Settings";
import { dbService, StoredResumeData } from "@/services/indexedDB";
import { sampleContent, sampleDistribution, sampleSections, sampleSettings, sampleStyle } from "./sampleData";

type Mode = "preview" | "edit";

interface SampleResumeContextType {
  sections: Section[];
  settings: Settings;
  style: ResumeStyle;
  distribution: Distribution;
  content: Record<string, Content>;
  mode: Mode;
  selectedNodeId: string | null;
  setSections: (sections: Section[]) => void;
  setSettings: (settings: Settings) => void;
  setStyle: (style: ResumeStyle) => void;
  setDistribution: (distribution: Distribution) => void;
  setContent: (content: Record<string, Content>) => void;
  setMode: (mode: Mode) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  updateContent: (sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => void;
  updateDistributionItem: (sectionId: string, item: Partial<DistributionItem>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updateStyle: (style: Partial<ResumeStyle>) => void;
  updateElementStyle: (elementId: string, style: Record<string, string | number>) => void;
  addSection: (section: Section) => void;
  removeSection: (sectionId: string) => void;
  addNode: (sectionId: string, tag: string, type: string, name: string, parentId: string, value?: string, props?: Record<string, string>) => void;
  deleteNode: (sectionId: string, nodeId: string) => void;
  updateNode: (sectionId: string, nodeId: string, tag?: string, name?: string) => void;
  addListItem: (sectionId: string, listNodeId: string) => void;
  deleteListItem: (sectionId: string, listItemId: string) => void;
  toggleMode: () => void;
  resetToSample: () => void;
  hasSavedData: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = "resumeData";
const SampleResumeContext = createContext<SampleResumeContextType | undefined>(undefined);

const makeId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
const contentKeyFor = (node: Schema) => (node as Schema & { value?: string }).value || node.id;

const normalizeDistribution = (sections: Section[], distribution: Distribution, settings: Settings): Distribution => {
  const next: Distribution = {};
  sections.forEach((section, index) => {
    const current = distribution[section.id];
    next[section.id] = {
      order: current?.order ?? index,
      position: settings.columns === "TWO" ? current?.position === "right" ? "right" : "left" : "FULL",
      visible: current?.visible ?? true,
      showIcon: current?.showIcon ?? true,
    };
  });
  return next;
};

const removeNodeContent = (node: Schema, draft: Record<string, Content>) => {
  delete draft[contentKeyFor(node)];
  node.children?.forEach((child) => removeNodeContent(child, draft));
};

const duplicateNode = (node: Schema, content: Record<string, Content>, nextContent: Record<string, Content>): Schema => {
  const newId = makeId(node.id);
  const oldKey = contentKeyFor(node);
  const newKey = content[oldKey] ? makeId(oldKey) : "";
  if (newKey) nextContent[newKey] = { ...content[oldKey], id: newKey };
  return {
    ...node,
    id: newId,
    name: `${node.name} copy`,
    value: newKey || (node as Schema & { value?: string }).value,
    children: node.children?.map((child) => duplicateNode(child, content, nextContent)) ?? [],
  };
};

function SampleResumeProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<Section[]>(sampleSections);
  const [settings, setSettingsState] = useState<Settings>(sampleSettings);
  const [style, setStyleState] = useState<ResumeStyle>(sampleStyle);
  const [distribution, setDistributionState] = useState<Distribution>(sampleDistribution);
  const [content, setContentState] = useState<Record<string, Content>>(sampleContent);
  const [mode, setMode] = useState<Mode>("edit");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    dbService.getResumeData(STORAGE_KEY).then((data) => {
      if (!mounted) return;
      if (data) {
        setSections(data.sections ?? sampleSections);
        setSettingsState(data.settings ?? sampleSettings);
        setStyleState(data.style ?? sampleStyle);
        setDistributionState(normalizeDistribution(data.sections ?? sampleSections, data.distribution ?? sampleDistribution, data.settings ?? sampleSettings));
        setContentState(data.content ?? sampleContent);
        setMode(data.mode ?? "edit");
        setHasSavedData(true);
      }
    }).finally(() => {
      if (mounted) { setIsLoading(false); setIsInitialized(true); }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    const data: StoredResumeData = { sections, settings, style, distribution, content, mode, updatedAt: new Date().toISOString() };
    dbService.saveResumeData(STORAGE_KEY, data).then(() => setHasSavedData(true)).catch(console.error);
  }, [sections, settings, style, distribution, content, mode, isInitialized, isLoading]);

  const setSettings = useCallback((next: Settings) => {
    const normalized = next.columns === "ONE" ? { ...next, sidebar: undefined } : { ...next, sidebar: next.sidebar ?? { position: "LEFT" } };
    setSettingsState(normalized);
    setDistributionState((prev) => normalizeDistribution(sections, prev, normalized));
  }, [sections]);

  const updateSettings = useCallback((patch: Partial<Settings>) => setSettings({ ...settings, ...patch }), [settings, setSettings]);
  const setDistribution = useCallback((next: Distribution) => setDistributionState(normalizeDistribution(sections, next, settings)), [sections, settings]);
  const setStyle = useCallback((next: ResumeStyle) => setStyleState(next), []);
  const setContent = useCallback((next: Record<string, Content>) => setContentState(next), []);

  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, ...updates } : s)), []);
  const updateContent = useCallback((_sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => setContentState((prev) => ({ ...prev, [nodeId]: { id: nodeId, type: prev[nodeId]?.type ?? "text", value, prop: props ?? prev[nodeId]?.prop } })), []);
  const updateDistributionItem = useCallback((sectionId: string, item: Partial<DistributionItem>) => setDistributionState((prev) => normalizeDistribution(sections, { ...prev, [sectionId]: { order: prev[sectionId]?.order ?? 0, position: prev[sectionId]?.position ?? "FULL", visible: prev[sectionId]?.visible ?? true, showIcon: prev[sectionId]?.showIcon ?? true, ...item } }, settings)), [sections, settings]);
  const updateStyle = useCallback((patch: Partial<ResumeStyle>) => setStyleState((prev) => ({ ...prev, ...patch })), []);
  const updateElementStyle = useCallback((elementId: string, elementStyle: Record<string, string | number>) => setStyleState((prev) => ({ ...prev, elements: { ...prev.elements, [elementId]: { ...prev.elements[elementId], ...elementStyle } } })), []);

  const addSection = useCallback((section: Section) => { setSections((p) => [...p, section]); setDistributionState((p) => ({ ...p, [section.id]: { order: Object.keys(p).length, position: settings.columns === "TWO" ? "left" : "FULL", visible: true, showIcon: true } })); }, [settings.columns]);
  const removeSection = useCallback((sectionId: string) => { setSections((p) => p.filter((s) => s.id !== sectionId)); setDistributionState((p) => { const n = { ...p }; delete n[sectionId]; return n; }); }, []);

  const addListItem = useCallback((sectionId: string, listNodeId: string) => {
    setSections((prev) => prev.map((section) => {
      if (section.id !== sectionId) return section;
      const nextContent = { ...content };
      const walk = (node: Schema): Schema => node.id === listNodeId && ["ul", "ol"].includes(node.tag)
        ? { ...node, children: [...(node.children ?? []), duplicateNode(node.children?.[node.children.length - 1] ?? { id: makeId("li"), tag: "li", type: "listItem", name: "Item", selectorGroup: "li", children: [] }, content, nextContent)] }
        : { ...node, children: node.children?.map(walk) ?? [] };
      setContentState(nextContent);
      return { ...section, schema: walk(section.schema) };
    }));
  }, [content]);

  const deleteListItem = useCallback((sectionId: string, listItemId: string) => {
    setSections((prev) => prev.map((section) => {
      if (section.id !== sectionId) return section;
      const nextContent = { ...content };
      const walk = (node: Schema): Schema => ({ ...node, children: (node.children ?? []).filter((child) => { const remove = child.id === listItemId && child.tag === "li"; if (remove) removeNodeContent(child, nextContent); return !remove; }).map(walk) });
      setContentState(nextContent);
      return { ...section, schema: walk(section.schema) };
    }));
  }, [content]);

  const addNode = useCallback((sectionId: string, _tag: string, _type: string, _name: string, parentId: string) => addListItem(sectionId, parentId), [addListItem]);
  const deleteNode = useCallback((sectionId: string, nodeId: string) => deleteListItem(sectionId, nodeId), [deleteListItem]);
  const updateNode = useCallback((sectionId: string, nodeId: string, tag?: string, name?: string) => setSections((prev) => prev.map((section) => { const walk = (node: Schema): Schema => node.id === nodeId ? { ...node, tag: tag ?? node.tag, name: name ?? node.name } : { ...node, children: node.children?.map(walk) ?? [] }; return section.id === sectionId ? { ...section, schema: walk(section.schema) } : section; })), []);
  const resetToSample = useCallback(() => { setSections(sampleSections); setSettingsState(sampleSettings); setStyleState(sampleStyle); setDistributionState(sampleDistribution); setContentState(sampleContent); setMode("edit"); setSelectedNodeId(null); setHasSavedData(false); }, []);
  const toggleMode = useCallback(() => setMode((prev) => { const next = prev === "edit" ? "preview" : "edit"; if (next === "preview") setSelectedNodeId(null); return next; }), []);

  const value = useMemo(() => ({ sections, settings, style, distribution, content, mode, selectedNodeId, setSections, setSettings, setStyle, setDistribution, setContent, setMode, setSelectedNodeId, updateSection, updateContent, updateDistributionItem, updateSettings, updateStyle, updateElementStyle, addSection, removeSection, addNode, deleteNode, updateNode, addListItem, deleteListItem, toggleMode, resetToSample, hasSavedData, isLoading }), [sections, settings, style, distribution, content, mode, selectedNodeId, setSettings, setStyle, setDistribution, setContent, updateSection, updateContent, updateDistributionItem, updateSettings, updateStyle, updateElementStyle, addSection, removeSection, addNode, deleteNode, updateNode, addListItem, deleteListItem, toggleMode, resetToSample, hasSavedData, isLoading]);
  return <SampleResumeContext.Provider value={value}>{children}</SampleResumeContext.Provider>;
}

export const useSampleResume = () => {
  const context = useContext(SampleResumeContext);
  if (!context) throw new Error("useSampleResume must be used within SampleResumeProvider");
  return context;
};

export const useResumeContext = useSampleResume;
export const ResumeProvider = SampleResumeProvider;
export { SampleResumeProvider };
