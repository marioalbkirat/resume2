"use client";

import { CSSProperties, useMemo, useState } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { Schema } from "@/types/resume/Section";
import { FiRefreshCw, FiSave } from "react-icons/fi";

type TabKey = "theme" | "typography" | "spacing" | "sections" | "selected";
type ControlKind = "text" | "color" | "range" | "select" | "buttonGroup";
type SmartGroup = "text" | "image" | "icon" | "layout" | "list" | "listItem";

interface ColorScheme {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

interface FontOption {
    id: string;
    name: string;
    value: string;
    className: string;
}

interface PresetOption {
    id: string;
    name: string;
    description: string;
    patch: Pick<ResumeStyle, "global" | "selectors" | "elements">;
}

interface ControlConfig {
    key: string;
    label: string;
    kind: ControlKind;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    options?: { label: string; value: string | number }[];
}

const emptyStyle: ResumeStyle = { global: {}, selectors: {}, elements: {}, customCSS: "" };

const colorSchemes: ColorScheme[] = [
    { id: "professional", name: "Professional Blue", primary: "#2563eb", secondary: "#3b82f6", accent: "#60a5fa", background: "#ffffff", text: "#1f2937" },
    { id: "modern", name: "Modern Purple", primary: "#7c3aed", secondary: "#8b5cf6", accent: "#a78bfa", background: "#faf5ff", text: "#4c1d95" },
    { id: "corporate", name: "Corporate Gray", primary: "#374151", secondary: "#4b5563", accent: "#6b7280", background: "#f9fafb", text: "#111827" },
    { id: "creative", name: "Creative Pink", primary: "#ec4899", secondary: "#f43f5e", accent: "#fb7185", background: "#fff1f2", text: "#9f1239" },
    { id: "dark", name: "Dark Mode", primary: "#3b82f6", secondary: "#60a5fa", accent: "#93c5fd", background: "#1e293b", text: "#f8fafc" },
];

const fontOptions: FontOption[] = [
    { id: "inter", name: "Inter", value: "Inter, ui-sans-serif, system-ui", className: "font-sans" },
    { id: "roboto", name: "Roboto", value: "Roboto, Arial, sans-serif", className: "font-sans" },
    { id: "opensans", name: "Open Sans", value: "'Open Sans', Arial, sans-serif", className: "font-sans" },
    { id: "lato", name: "Lato", value: "Lato, Arial, sans-serif", className: "font-sans" },
    { id: "playfair", name: "Playfair Display", value: "'Playfair Display', Georgia, serif", className: "font-serif" },
];

const selectorGroups = [
    { key: "heading", label: "Headings", description: "Titles and section names" },
    { key: "paragraph", label: "Paragraphs", description: "Long descriptions" },
    { key: "text", label: "Text", description: "Short labels and values" },
    { key: "list", label: "Lists", description: "List containers" },
    { key: "listItem", label: "List items", description: "Rows inside lists" },
    { key: "image", label: "Images", description: "Photos and logos" },
    { key: "icon", label: "Icons", description: "Small visual symbols" },
    { key: "link", label: "Links", description: "Clickable text" },
    { key: "section", label: "Sections", description: "Resume blocks" },
    { key: "container", label: "Containers", description: "Layout wrappers" },
];

const textControls: ControlConfig[] = [
    { key: "fontFamily", label: "Font", kind: "select", options: fontOptions.map((font) => ({ label: font.name, value: font.value })) },
    { key: "fontSize", label: "Size", kind: "range", min: 10, max: 36, unit: "px" },
    { key: "fontWeight", label: "Weight", kind: "buttonGroup", options: [{ label: "Regular", value: 400 }, { label: "Medium", value: 500 }, { label: "Bold", value: 700 }, { label: "Heavy", value: 800 }] },
    { key: "color", label: "Color", kind: "color" },
    { key: "lineHeight", label: "Line height", kind: "range", min: 1, max: 2.2, step: 0.1 },
    { key: "textAlign", label: "Align", kind: "buttonGroup", options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }] },
    { key: "margin", label: "Margin", kind: "text" },
    { key: "padding", label: "Padding", kind: "text" },
];

const imageControls: ControlConfig[] = [
    { key: "width", label: "Width", kind: "range", min: 40, max: 320, unit: "px" },
    { key: "height", label: "Height", kind: "range", min: 40, max: 320, unit: "px" },
    { key: "borderRadius", label: "Corners", kind: "range", min: 0, max: 80, unit: "px" },
    { key: "objectFit", label: "Fit", kind: "buttonGroup", options: [{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }] },
    { key: "margin", label: "Margin", kind: "text" },
    { key: "padding", label: "Padding", kind: "text" },
];

const iconControls: ControlConfig[] = [
    { key: "fontSize", label: "Size", kind: "range", min: 10, max: 64, unit: "px" },
    { key: "color", label: "Color", kind: "color" },
    { key: "margin", label: "Margin", kind: "text" },
    { key: "padding", label: "Padding", kind: "text" },
];

const layoutControls: ControlConfig[] = [
    { key: "display", label: "Display", kind: "buttonGroup", options: [{ label: "Block", value: "block" }, { label: "Flex", value: "flex" }, { label: "Grid", value: "grid" }] },
    { key: "flexDirection", label: "Direction", kind: "buttonGroup", options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }] },
    { key: "gap", label: "Gap", kind: "range", min: 0, max: 40, unit: "px" },
    { key: "alignItems", label: "Align items", kind: "select", options: ["stretch", "flex-start", "center", "flex-end"].map((value) => ({ label: value, value })) },
    { key: "justifyContent", label: "Justify", kind: "select", options: ["flex-start", "center", "space-between", "flex-end"].map((value) => ({ label: value, value })) },
    { key: "backgroundColor", label: "Background", kind: "color" },
    { key: "borderRadius", label: "Corners", kind: "range", min: 0, max: 40, unit: "px" },
    { key: "margin", label: "Margin", kind: "text" },
    { key: "padding", label: "Padding", kind: "text" },
];

const listControls: ControlConfig[] = [...layoutControls, { key: "listStyleType", label: "Bullet style", kind: "buttonGroup", options: [{ label: "Disc", value: "disc" }, { label: "Circle", value: "circle" }, { label: "Number", value: "decimal" }, { label: "None", value: "none" }] }];
const globalControls: ControlConfig[] = [
    { key: "fontFamily", label: "Font", kind: "select", options: fontOptions.map((font) => ({ label: font.name, value: font.value })) },
    { key: "fontSize", label: "Base size", kind: "range", min: 10, max: 22, unit: "px" },
    { key: "color", label: "Text", kind: "color" },
    { key: "backgroundColor", label: "Background", kind: "color" },
    { key: "lineHeight", label: "Line height", kind: "range", min: 1, max: 2.2, step: 0.1 },
    { key: "padding", label: "Page padding", kind: "text" },
    { key: "margin", label: "Page margin", kind: "text" },
];

const presets: PresetOption[] = [
    { id: "clean", name: "Clean", description: "Blue titles, white page, comfortable reading.", patch: { global: { backgroundColor: "#ffffff", color: "#1f2937", fontFamily: fontOptions[0].value, fontSize: "14px", lineHeight: 1.55, padding: "10mm", margin: "0" }, selectors: { heading: { color: "#2563eb", fontWeight: 700, fontSize: "20px", margin: "0 0 8px" }, section: { padding: "12px", margin: "0 0 10px" } }, elements: {} } },
    { id: "modern", name: "Modern", description: "Soft purple theme with card-like sections.", patch: { global: { backgroundColor: "#faf5ff", color: "#4c1d95", fontFamily: fontOptions[0].value, fontSize: "14px", lineHeight: 1.6, padding: "10mm" }, selectors: { heading: { color: "#7c3aed", fontWeight: 800, fontSize: "21px" }, section: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "14px", margin: "0 0 12px" } }, elements: {} } },
    { id: "classic", name: "Classic", description: "Traditional black text with crisp dividers.", patch: { global: { backgroundColor: "#ffffff", color: "#111827", fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1.5, padding: "10mm" }, selectors: { heading: { color: "#111827", fontWeight: 700, borderBottom: "1px solid #d1d5db", padding: "0 0 4px", margin: "0 0 8px" } }, elements: {} } },
];

const tabs: { key: TabKey; label: string }[] = [
    { key: "theme", label: "Theme" },
    { key: "typography", label: "Typography" },
    { key: "spacing", label: "Spacing" },
    { key: "sections", label: "Sections" },
    { key: "selected", label: "Selected Element" },
];

const walkSchema = (node: Schema, items: Schema[] = []) => {
    items.push(node);
    node.children?.forEach((child) => walkSchema(child, items));
    return items;
};

const asCssProperties = (value?: StyleObject) => (value ?? {}) as CSSProperties;
const cleanStyle = (value: StyleObject) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== "" && item !== undefined && item !== null)) as StyleObject;
const withUnit = (value: string | number, unit?: string) => (unit && value !== "" ? `${value}${unit}` : value);
const getNumberish = (value: string | number | undefined, fallback: number) => {
    if (typeof value === "number") return value;
    const parsed = Number.parseFloat(String(value ?? ""));
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getSmartGroup = (node?: Pick<Schema, "tag" | "type" | "selectorGroup"> | null): SmartGroup => {
    const value = `${node?.selectorGroup ?? ""} ${node?.type ?? ""} ${node?.tag ?? ""}`.toLowerCase();
    if (/img|image/.test(value)) return "image";
    if (/icon|\bi\b/.test(value)) return "icon";
    if (/ul|ol|list\b/.test(value)) return "list";
    if (/li|listitem|list-item/.test(value)) return "listItem";
    if (/section|container|div|layout/.test(value)) return "layout";
    return "text";
};

const getControls = (group: SmartGroup) => {
    if (group === "image") return imageControls;
    if (group === "icon") return iconControls;
    if (group === "list") return listControls;
    if (group === "listItem" || group === "layout") return layoutControls;
    return textControls;
};

export default function StylesPanel() {
    const { style, setStyle, sections, selectedNodeId } = useResumeBuilder();
    const [draft, setDraft] = useState<ResumeStyle>(() => ({ global: style.global ?? {}, selectors: style.selectors ?? {}, elements: style.elements ?? {}, customCSS: style.customCSS ?? "" }));
    const [activeTab, setActiveTab] = useState<TabKey>("theme");
    const [selectedColor, setSelectedColor] = useState("modern");
    const [selectedFont, setSelectedFont] = useState("inter");
    const [selectorKey, setSelectorKey] = useState("heading");

    const nodes = useMemo(() => sections.flatMap((section) => walkSchema(section.schema).map((node) => ({ ...node, sectionName: section.name }))), [sections]);
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    const elementKey = selectedNode?.id ?? "";
    const selectedGroup = getSmartGroup(selectedNode);
    const selectorGroup = getSmartGroup({ tag: selectorKey, type: selectorKey, selectorGroup: selectorKey });
    const currentColor = colorSchemes.find((scheme) => scheme.id === selectedColor) ?? colorSchemes[0];
    const currentFont = fontOptions.find((font) => font.id === selectedFont) ?? fontOptions[0];

    const updateGlobal = (patch: StyleObject) => setDraft((previous) => ({ ...previous, global: cleanStyle({ ...previous.global, ...patch }) }));
    const updateSelector = (key: string, patch: StyleObject) => setDraft((previous) => ({ ...previous, selectors: { ...previous.selectors, [key]: cleanStyle({ ...(previous.selectors?.[key] ?? {}), ...patch }) } }));
    const updateElement = (patch: StyleObject) => {
        if (!elementKey) return;
        setDraft((previous) => ({ ...previous, elements: { ...previous.elements, [elementKey]: cleanStyle({ ...(previous.elements?.[elementKey] ?? {}), ...patch }) } }));
    };

    const applyTheme = (scheme: ColorScheme) => {
        setSelectedColor(scheme.id);
        updateGlobal({ "--resume-primary": scheme.primary, "--resume-secondary": scheme.secondary, "--resume-accent": scheme.accent, backgroundColor: scheme.background, color: scheme.text });
        updateSelector("heading", { color: scheme.primary });
        updateSelector("link", { color: scheme.secondary });
        updateSelector("icon", { color: scheme.accent });
    };

    const applyPreset = (preset: PresetOption) => setDraft((previous) => ({
        ...previous,
        global: cleanStyle({ ...previous.global, ...preset.patch.global }),
        selectors: { ...previous.selectors, ...preset.patch.selectors },
        elements: { ...previous.elements, ...preset.patch.elements },
    }));

    const applyStyles = () => setStyle((previous) => ({ ...previous, global: draft.global, selectors: draft.selectors, elements: draft.elements, customCSS: previous.customCSS ?? "" }));
    const resetStyles = () => {
        setDraft(emptyStyle);
        setStyle(emptyStyle);
    };

    const renderControls = (controls: ControlConfig[], activeStyle: StyleObject, onChange: (patch: StyleObject) => void, disabled = false) => (
        <div className="grid gap-4 md:grid-cols-2">
            {controls.map((control) => {
                const rawValue = activeStyle[control.key];
                if (control.kind === "range") {
                    const value = getNumberish(rawValue, control.min ?? 0);
                    return <label key={control.key} className="block text-sm font-medium text-gray-700">{control.label}: <span className="text-blue-600">{value}{control.unit}</span><input type="range" min={control.min} max={control.max} step={control.step ?? 1} value={value} disabled={disabled} onChange={(event) => onChange({ [control.key]: withUnit(event.target.value, control.unit) })} className="mt-2 w-full disabled:opacity-50" /></label>;
                }
                if (control.kind === "buttonGroup") {
                    return <div key={control.key} className="text-sm font-medium text-gray-700"><p className="mb-2">{control.label}</p><div className="flex flex-wrap gap-2">{control.options?.map((option) => <button key={String(option.value)} disabled={disabled} onClick={() => onChange({ [control.key]: option.value })} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${rawValue === option.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>{option.label}</button>)}</div></div>;
                }
                if (control.kind === "select") {
                    return <label key={control.key} className="block text-sm font-medium text-gray-700">{control.label}<select value={String(rawValue ?? "")} disabled={disabled} onChange={(event) => onChange({ [control.key]: event.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 disabled:bg-gray-100"><option value="">Keep current</option>{control.options?.map((option) => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}</select></label>;
                }
                return <label key={control.key} className="block text-sm font-medium text-gray-700">{control.label}<input type={control.kind === "color" ? "color" : "text"} value={control.kind === "color" && !rawValue ? "#000000" : String(rawValue ?? "")} disabled={disabled} placeholder="Example: 12px or 0 0 8px" onChange={(event) => onChange({ [control.key]: event.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 disabled:bg-gray-100" /></label>;
            })}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Resume Style</h3>
                        <p className="mt-1 text-sm text-gray-500">Design your resume with simple choices: colors, fonts, spacing, sections, and the selected item.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 rounded-xl bg-gray-100 p-1">
                        {tabs.map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition ${activeTab === tab.key ? "bg-white text-blue-700 shadow" : "text-gray-600 hover:text-gray-900"}`}>{tab.label}</button>)}
                    </div>
                </div>
            </div>

            {activeTab === "theme" && <div className="space-y-6"><div className="rounded-xl bg-white p-6 shadow-lg"><h3 className="mb-4 text-lg font-semibold text-gray-900">Color schemes</h3><div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">{colorSchemes.map((scheme) => <button key={scheme.id} onClick={() => applyTheme(scheme)} className={`cursor-pointer rounded-xl p-4 text-left transition-all ${selectedColor === scheme.id ? "shadow-lg ring-2 ring-blue-500 ring-offset-2" : "hover:shadow-md"}`} style={{ backgroundColor: scheme.background }}><div className="space-y-2"><div className="flex gap-1"><span className="h-6 w-6 rounded-full" style={{ backgroundColor: scheme.primary }} /><span className="h-6 w-6 rounded-full" style={{ backgroundColor: scheme.secondary }} /><span className="h-6 w-6 rounded-full" style={{ backgroundColor: scheme.accent }} /></div><p className="text-sm font-medium" style={{ color: scheme.text }}>{scheme.name}</p></div></button>)}</div></div><div className="grid gap-4 md:grid-cols-3">{presets.map((preset) => <button key={preset.id} onClick={() => applyPreset(preset)} className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"><p className="font-semibold text-gray-900">{preset.name}</p><p className="mt-1 text-sm text-gray-500">{preset.description}</p></button>)}</div></div>}

            {activeTab === "typography" && <div className="rounded-xl bg-white p-6 shadow-lg"><h3 className="mb-4 text-lg font-semibold text-gray-900">Typography</h3><div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{fontOptions.map((font) => <button key={font.id} onClick={() => { setSelectedFont(font.id); updateGlobal({ fontFamily: font.value }); }} className={`cursor-pointer rounded-lg border p-3 text-left transition-all ${selectedFont === font.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}><p className={`${font.className} font-medium`}>{font.name}</p><p className={`${font.className} mt-1 text-xs text-gray-500`}>The quick brown fox</p></button>)}</div>{renderControls(globalControls.filter((control) => ["fontFamily", "fontSize", "color", "lineHeight"].includes(control.key)), draft.global, updateGlobal)}</div>}

            {activeTab === "spacing" && <div className="rounded-xl bg-white p-6 shadow-lg"><h3 className="mb-4 text-lg font-semibold text-gray-900">Spacing</h3>{renderControls(globalControls.filter((control) => ["padding", "margin", "backgroundColor"].includes(control.key)), draft.global, updateGlobal)}</div>}

            {activeTab === "sections" && <div className="grid gap-6 lg:grid-cols-[280px_1fr]"><div className="rounded-xl bg-white p-6 shadow-lg"><h3 className="mb-4 text-lg font-semibold text-gray-900">Element groups</h3><div className="grid gap-2">{selectorGroups.map((group) => <button key={group.key} onClick={() => setSelectorKey(group.key)} title={group.description} className={`cursor-pointer rounded-lg border px-3 py-2 text-left text-sm ${selectorKey === group.key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>{group.label}<span className="mt-1 block text-xs opacity-70">{group.description}</span></button>)}</div></div><div className="rounded-xl bg-white p-6 shadow-lg"><h3 className="mb-4 text-lg font-semibold text-gray-900">Style all {selectorGroups.find((group) => group.key === selectorKey)?.label}</h3>{renderControls(getControls(selectorGroup), draft.selectors?.[selectorKey] ?? {}, (patch) => updateSelector(selectorKey, patch))}</div></div>}

            {activeTab === "selected" && <div className="rounded-xl bg-white p-6 shadow-lg"><div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><h3 className="text-lg font-semibold text-gray-900">Selected Element</h3><p className="text-sm text-gray-500">{selectedNode ? `Editing only: ${selectedNode.name} (${selectedNode.tag})` : "Click an element in the resume preview to customize it here."}</p></div>{selectedNode && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Smart controls: {selectedGroup}</span>}</div>{renderControls(getControls(selectedGroup), draft.elements?.[elementKey] ?? {}, updateElement, !elementKey)}</div>}

            <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4"><h3 className="text-lg font-semibold text-gray-900">Live Preview</h3></div>
                <div className="p-6 transition-all" style={{ ...asCssProperties(draft.global), backgroundColor: String(draft.global.backgroundColor ?? currentColor.background), color: String(draft.global.color ?? currentColor.text), fontFamily: String(draft.global.fontFamily ?? currentFont.value) }}>
                    <div className="space-y-4 rounded-xl bg-white/70 p-5" style={asCssProperties(draft.selectors.section)}><h2 className="text-2xl font-bold" style={asCssProperties(draft.selectors.heading)}>John Doe</h2><p style={asCssProperties(draft.selectors.paragraph)}>Experienced software developer with expertise in building clean, readable resumes and elegant web interfaces.</p><ul className="flex flex-wrap gap-3" style={asCssProperties(draft.selectors.list)}><li style={asCssProperties(draft.selectors.listItem)}>React</li><li style={asCssProperties(draft.selectors.listItem)}>Design Systems</li><li style={asCssProperties(draft.selectors.listItem)}>Leadership</li></ul><div className="flex gap-3"><span className="rounded-lg px-4 py-2 text-white" style={{ backgroundColor: currentColor.primary, ...asCssProperties(draft.selectors.link) }}>Portfolio</span><span className="rounded-lg px-4 py-2" style={{ backgroundColor: `${currentColor.secondary}20`, color: currentColor.secondary }}>Download CV</span></div></div>
                </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg"><div className="flex flex-wrap justify-end gap-4"><button onClick={resetStyles} className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-100 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"><FiRefreshCw className="h-4 w-4" />Reset</button><button onClick={applyStyles} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"><FiSave className="h-4 w-4" />Apply</button></div></div>
        </div>
    );
}
