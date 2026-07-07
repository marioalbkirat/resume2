"use client";

import { CSSProperties, useEffect, useMemo } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { Schema } from "@/types/resume/Section";

export type VisualGroup = "section" | "heading" | "paragraph" | "text" | "list" | "listItem" | "icon" | "image" | "link" | "container";
export type ColorTarget = { scope: "global" | "selector" | "element"; key: string; target?: string; label: string };

export const defaultGlobalStyle: StyleObject = { fontFamily: "Arial", backgroundColor: "#ffffff" };
export const emptyResumeStyle: ResumeStyle = { global: defaultGlobalStyle, selectors: {}, elements: {}, customCSS: "" };
export const visualGroups: VisualGroup[] = ["section", "heading", "paragraph", "text", "list", "listItem", "icon", "image", "link", "container"];
export const fonts = [
  { id: "inter", name: "Inter", value: "Inter, ui-sans-serif, system-ui" },
  { id: "serif", name: "Classic", value: "Georgia, 'Times New Roman', serif" },
  { id: "mono", name: "Modern Mono", value: "'SFMono-Regular', Consolas, monospace" },
  { id: "rounded", name: "Friendly", value: "ui-rounded, 'Nunito', Arial, sans-serif" },
  { id: "system", name: "System", value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { id: "garamond", name: "Garamond", value: "Garamond, 'EB Garamond', Georgia, serif" },
  { id: "palatino", name: "Palatino", value: "Palatino, 'Palatino Linotype', 'Book Antiqua', serif" },
  { id: "cambria", name: "Cambria", value: "Cambria, Georgia, serif" },
  { id: "verdana", name: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { id: "trebuchet", name: "Trebuchet", value: "'Trebuchet MS', Arial, sans-serif" },
  { id: "tahoma", name: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { id: "century", name: "Century", value: "'Century Gothic', 'Avenir Next', sans-serif" },
  { id: "courier", name: "Courier", value: "'Courier New', Courier, monospace" },
];
export const themes: { id: string; name: string; colors: string[]; patch: Pick<ResumeStyle, "global" | "selectors"> }[] = [
  { id: "calm", name: "Calm Blue", colors: ["#eff6ff", "#2563eb", "#0f172a"], patch: { global: { backgroundColor: "#ffffff", color: "#0f172a", "--resume-primary": "#2563eb" }, selectors: { heading: { color: "#2563eb" }, icon: { color: "#2563eb" }, section: { backgroundColor: "#ffffff" } } } },
  { id: "creative", name: "Creative Rose", colors: ["#fff1f2", "#e11d48", "#4c0519"], patch: { global: { backgroundColor: "#fff7f7", color: "#4c0519", "--resume-primary": "#e11d48" }, selectors: { heading: { color: "#e11d48" }, icon: { color: "#e11d48" }, section: { backgroundColor: "#ffffff", borderRadius: "18px" } } } },
  { id: "earth", name: "Earth Green", colors: ["#ecfdf5", "#059669", "#064e3b"], patch: { global: { backgroundColor: "#f8fffb", color: "#064e3b", "--resume-primary": "#059669" }, selectors: { heading: { color: "#047857" }, icon: { color: "#059669" }, section: { backgroundColor: "#ffffff" } } } },
  { id: "mono", name: "Editorial", colors: ["#ffffff", "#111827", "#9ca3af"], patch: { global: { backgroundColor: "#ffffff", color: "#111827", "--resume-primary": "#111827" }, selectors: { heading: { color: "#111827", borderBottom: "1px solid #d1d5db" }, icon: { color: "#111827" }, section: { backgroundColor: "transparent" } } } },
];

const clean = (value: StyleObject) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== "" && item !== undefined && item !== null)) as StyleObject;
const globalOnlyKeys = new Set(["color", "fontSize", "lineHeight", "margin"]);
const cleanGlobal = (value: StyleObject) => clean(Object.fromEntries(Object.entries(value).filter(([key]) => !globalOnlyKeys.has(key))) as StyleObject);
const walk = (node: Schema, items: Schema[] = []) => { items.push(node); node.children?.forEach((child) => walk(child, items)); return items; };
export const toCss = (style?: StyleObject) => (style ?? {}) as CSSProperties;
export const numberValue = (value: string | number | undefined, fallback: number) => { const parsed = Number.parseFloat(String(value ?? "")); return Number.isFinite(parsed) ? parsed : fallback; };
export const withPx = (value: string | number) => `${value}px`;

export function getVisualGroup(node?: Pick<Schema, "tag" | "type"> | null): VisualGroup {
  const tag = String(node?.tag ?? "").toLowerCase();
  const type = String(node?.type ?? "").toLowerCase();
  const exactTagGroups: Partial<Record<string, VisualGroup>> = {
    section: "section",
    div: "container",
    li: "listItem",
    ul: "list",
    ol: "list",
    img: "image",
    i: "icon",
    p: "paragraph",
    span: "text",
    h1: "heading",
    h2: "heading",
    h3: "heading",
    h4: "heading",
    h5: "heading",
    h6: "heading",
    a: "link",
  };

  if (exactTagGroups[tag]) return exactTagGroups[tag];

  const text = `${tag} ${type}`.toLowerCase();
  if (/img|image|photo|avatar|logo/.test(text)) return "image";
  if (/icon|svg|\bi\b/.test(text)) return "icon";
  if (/li|listitem/.test(text)) return "listItem";
  if (/ul|ol|list/.test(text)) return "list";
  if (/section/.test(text)) return "section";
  if (/container|div|wrapper|row|column|article|header|footer/.test(text)) return "container";
  if (/\ba\b|link|url/.test(text)) return "link";
  if (/span|text/.test(text)) return "text";
  if (/p|paragraph|summary|description/.test(text)) return "paragraph";
  return "heading";
}

export function useVisualStylesPanel() {
  const { style, setStyle, sections, selectedNodeId, settings } = useResumeBuilder();
  const nodes = useMemo(() => sections.flatMap((section) => walk(section.schema).map((node) => ({ ...node, sectionName: section.name }))), [sections]);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedGroup = getVisualGroup(selectedNode);

  useEffect(() => {
    if (Object.keys(style.global ?? {}).some((key) => globalOnlyKeys.has(key))) {
      setStyle((previous) => ({ ...previous, global: cleanGlobal({ ...defaultGlobalStyle, ...(previous.global ?? {}) }) }));
    }
  }, [setStyle, style.global]);

  const updateStyle = (recipe: (previous: ResumeStyle) => ResumeStyle) => setStyle((previous) => {
    const next = recipe({ global: cleanGlobal({ ...defaultGlobalStyle, ...(previous.global ?? {}) }), selectors: previous.selectors ?? {}, elements: previous.elements ?? {}, customCSS: previous.customCSS ?? "" });
    const normalizedStyle = { ...next, global: cleanGlobal({ ...defaultGlobalStyle, ...(next.global ?? {}) }) };
    console.log("Resume style updated", normalizedStyle);
    return normalizedStyle;
  });
  const updateGlobal = (patch: StyleObject) => updateStyle((previous) => ({ ...previous, global: cleanGlobal({ ...previous.global, ...patch }) }));
  const updateSelector = (target: string, patch: StyleObject) => updateStyle((previous) => ({ ...previous, selectors: { ...previous.selectors, [target]: clean({ ...(previous.selectors?.[target] ?? {}), ...patch }) } }));
  const updateElement = (patch: StyleObject) => selectedNode && updateStyle((previous) => ({ ...previous, elements: { ...previous.elements, [selectedNode.id]: clean({ ...(previous.elements?.[selectedNode.id] ?? {}), ...patch }) } }));
  const setColor = (target: ColorTarget, color: string) => { if (target.scope === "global") updateGlobal({ [target.key]: color }); if (target.scope === "selector" && target.target) updateSelector(target.target, { [target.key]: color }); if (target.scope === "element") updateElement({ [target.key]: color }); };
  const valueFor = (target: ColorTarget) => String(target.scope === "global" ? style.global?.[target.key] ?? "#111827" : target.scope === "selector" && target.target ? style.selectors?.[target.target]?.[target.key] ?? "#111827" : selectedNode ? style.elements?.[selectedNode.id]?.[target.key] ?? "#111827" : "#111827");
  const applyTheme = (theme: typeof themes[number]) => updateStyle((previous) => ({ ...previous, global: clean({ ...previous.global, ...theme.patch.global }), selectors: { ...previous.selectors, ...theme.patch.selectors } }));
  const resetStyles = () => setStyle(emptyResumeStyle);
  const applyStyles = () => setStyle((previous) => ({ ...previous, global: cleanGlobal({ ...defaultGlobalStyle, ...(previous.global ?? {}) }) }));

  return { style: { ...style, global: cleanGlobal({ ...defaultGlobalStyle, ...(style.global ?? {}) }) }, settings, selectedNode, selectedGroup, themes, fonts, updateGlobal, updateSelector, updateElement, setColor, valueFor, applyTheme, resetStyles, applyStyles };
}
