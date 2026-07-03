"use client";

import { CSSProperties, useMemo, useState } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { Schema } from "@/types/resume/Section";

export type VisualGroup = "heading" | "paragraph" | "image" | "icon" | "list" | "container";
export type ColorTarget = { scope: "global" | "selector" | "element"; key: string; target?: string; label: string };

export const emptyResumeStyle: ResumeStyle = { global: {}, selectors: {}, elements: {}, customCSS: "" };
export const quickColors = ["#111827", "#ffffff", "#2563eb", "#7c3aed", "#ec4899", "#f97316", "#10b981", "#64748b"];
export const fonts = [
  { id: "inter", name: "Inter", value: "Inter, ui-sans-serif, system-ui" },
  { id: "serif", name: "Classic", value: "Georgia, 'Times New Roman', serif" },
  { id: "mono", name: "Modern Mono", value: "'SFMono-Regular', Consolas, monospace" },
  { id: "rounded", name: "Friendly", value: "ui-rounded, 'Nunito', Arial, sans-serif" },
];
export const themes: { id: string; name: string; colors: string[]; patch: Pick<ResumeStyle, "global" | "selectors"> }[] = [
  { id: "calm", name: "Calm Blue", colors: ["#eff6ff", "#2563eb", "#0f172a"], patch: { global: { backgroundColor: "#ffffff", color: "#0f172a", "--resume-primary": "#2563eb" }, selectors: { heading: { color: "#2563eb" }, icon: { color: "#2563eb" }, section: { backgroundColor: "#ffffff" } } } },
  { id: "creative", name: "Creative Rose", colors: ["#fff1f2", "#e11d48", "#4c0519"], patch: { global: { backgroundColor: "#fff7f7", color: "#4c0519", "--resume-primary": "#e11d48" }, selectors: { heading: { color: "#e11d48" }, icon: { color: "#e11d48" }, section: { backgroundColor: "#ffffff", borderRadius: "18px" } } } },
  { id: "earth", name: "Earth Green", colors: ["#ecfdf5", "#059669", "#064e3b"], patch: { global: { backgroundColor: "#f8fffb", color: "#064e3b", "--resume-primary": "#059669" }, selectors: { heading: { color: "#047857" }, icon: { color: "#059669" }, section: { backgroundColor: "#ffffff" } } } },
  { id: "mono", name: "Editorial", colors: ["#ffffff", "#111827", "#9ca3af"], patch: { global: { backgroundColor: "#ffffff", color: "#111827", "--resume-primary": "#111827" }, selectors: { heading: { color: "#111827", borderBottom: "1px solid #d1d5db" }, icon: { color: "#111827" }, section: { backgroundColor: "transparent" } } } },
];

const clean = (value: StyleObject) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== "" && item !== undefined && item !== null)) as StyleObject;
const walk = (node: Schema, items: Schema[] = []) => { items.push(node); node.children?.forEach((child) => walk(child, items)); return items; };
export const toCss = (style?: StyleObject) => (style ?? {}) as CSSProperties;
export const numberValue = (value: string | number | undefined, fallback: number) => { const parsed = Number.parseFloat(String(value ?? "")); return Number.isFinite(parsed) ? parsed : fallback; };
export const withPx = (value: string | number) => `${value}px`;

export function getVisualGroup(node?: Pick<Schema, "tag" | "type" | "selectorGroup"> | null): VisualGroup {
  const text = `${node?.tag ?? ""} ${node?.type ?? ""} ${node?.selectorGroup ?? ""}`.toLowerCase();
  if (/img|image|photo|avatar|logo/.test(text)) return "image";
  if (/icon|svg|\bi\b/.test(text)) return "icon";
  if (/ul|ol|li|list/.test(text)) return "list";
  if (/section|container|div|wrapper|row|column|article|header|footer/.test(text)) return "container";
  if (/p|paragraph|summary|description/.test(text)) return "paragraph";
  return "heading";
}

export function useVisualStylesPanel() {
  const { style, setStyle, sections, selectedNodeId } = useResumeBuilder();
  const [activePicker, setActivePicker] = useState<ColorTarget | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const nodes = useMemo(() => sections.flatMap((section) => walk(section.schema).map((node) => ({ ...node, sectionName: section.name }))), [sections]);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedGroup = getVisualGroup(selectedNode);

  const updateStyle = (recipe: (previous: ResumeStyle) => ResumeStyle) => setStyle((previous) => recipe({ global: previous.global ?? {}, selectors: previous.selectors ?? {}, elements: previous.elements ?? {}, customCSS: previous.customCSS ?? "" }));
  const updateGlobal = (patch: StyleObject) => updateStyle((previous) => ({ ...previous, global: clean({ ...previous.global, ...patch }) }));
  const updateSelector = (target: string, patch: StyleObject) => updateStyle((previous) => ({ ...previous, selectors: { ...previous.selectors, [target]: clean({ ...(previous.selectors?.[target] ?? {}), ...patch }) } }));
  const updateElement = (patch: StyleObject) => selectedNode && updateStyle((previous) => ({ ...previous, elements: { ...previous.elements, [selectedNode.id]: clean({ ...(previous.elements?.[selectedNode.id] ?? {}), ...patch }) } }));
  const setColor = (target: ColorTarget, color: string) => { setRecentColors((prev) => [color, ...prev.filter((item) => item !== color)].slice(0, 8)); if (target.scope === "global") updateGlobal({ [target.key]: color }); if (target.scope === "selector" && target.target) updateSelector(target.target, { [target.key]: color }); if (target.scope === "element") updateElement({ [target.key]: color }); };
  const valueFor = (target: ColorTarget) => String(target.scope === "global" ? style.global?.[target.key] ?? "#111827" : target.scope === "selector" && target.target ? style.selectors?.[target.target]?.[target.key] ?? "#111827" : selectedNode ? style.elements?.[selectedNode.id]?.[target.key] ?? "#111827" : "#111827");
  const applyTheme = (theme: typeof themes[number]) => updateStyle((previous) => ({ ...previous, global: clean({ ...previous.global, ...theme.patch.global }), selectors: { ...previous.selectors, ...theme.patch.selectors } }));
  const resetStyles = () => setStyle(emptyResumeStyle);
  const applyStyles = () => setStyle((previous) => ({ ...previous }));

  return { style, selectedNode, selectedGroup, activePicker, setActivePicker, recentColors, themes, fonts, updateGlobal, updateSelector, updateElement, setColor, valueFor, applyTheme, resetStyles, applyStyles };
}
