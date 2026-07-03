"use client";

import { useMemo, useState } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { Schema } from "@/types/resume/Section";
import { FiRefreshCw, FiSliders } from "react-icons/fi";

type StyleTarget = "global" | "selector" | "element";
type StyleField = "color" | "backgroundColor" | "fontSize" | "fontWeight" | "fontStyle" | "lineHeight" | "margin" | "padding" | "border" | "borderRadius" | "sidebarBackgroundColor" | "mainBackgroundColor" | "columnBorder";

const emptyStyle: ResumeStyle = { global: {}, selectors: {}, elements: {}, customCSS: "" };

const selectorGroups = [
    { key: "section", label: "Section", description: "The full content block" },
    { key: "heading", label: "Heading", description: "Section titles and main headings" },
    { key: "paragraph", label: "Paragraph", description: "Longer descriptive text" },
    { key: "text", label: "Text", description: "Short text fields" },
    { key: "list", label: "List", description: "Bulleted or numbered lists" },
    { key: "listItem", label: "List item", description: "Each item inside a list" },
    { key: "icon", label: "Icon", description: "Decorative or section icons" },
    { key: "image", label: "Image", description: "Photos and logos" },
    { key: "link", label: "Link", description: "Clickable links" },
];

const generalFields: { key: StyleField; label: string; type: "color" | "text" | "number"; placeholder?: string }[] = [
    { key: "color", label: "Text color", type: "color" },
    { key: "backgroundColor", label: "Background color", type: "color" },
    { key: "fontSize", label: "Font size", type: "number", placeholder: "14" },
    { key: "fontWeight", label: "Font weight", type: "text", placeholder: "400 / 700 / bold" },
    { key: "fontStyle", label: "Font style", type: "text", placeholder: "normal / italic" },
    { key: "lineHeight", label: "Line height", type: "text", placeholder: "1.5 / 22px" },
    { key: "margin", label: "Margin", type: "text", placeholder: "0 0 8px" },
    { key: "padding", label: "Padding", type: "text", placeholder: "12px" },
    { key: "border", label: "Border", type: "text", placeholder: "1px solid #e5e7eb" },
    { key: "borderRadius", label: "Round corners", type: "text", placeholder: "8px" },
];

const globalFields: { key: StyleField; label: string; type: "color" | "text"; placeholder?: string }[] = [
    { key: "fontStyle", label: "Font style", type: "text", placeholder: "normal / italic" },
    { key: "lineHeight", label: "Line height", type: "text", placeholder: "1.5 / 22px" },
    { key: "margin", label: "Outer margin", type: "text", placeholder: "0" },
    { key: "padding", label: "Page padding", type: "text", placeholder: "10mm" },
    { key: "backgroundColor", label: "Page background", type: "color" },
    { key: "sidebarBackgroundColor", label: "Sidebar background", type: "color" },
    { key: "mainBackgroundColor", label: "Right side background", type: "color" },
    { key: "columnBorder", label: "Border between sides", type: "text", placeholder: "1px solid #e5e7eb" },
];

const presets: { id: string; name: string; description: string; patch: ResumeStyle }[] = [
    { id: "clean", name: "Clean", description: "Simple blue headings with readable spacing.", patch: { global: { backgroundColor: "#ffffff", lineHeight: "1.55", padding: "10mm" }, selectors: { heading: { color: "#1d4ed8", fontWeight: 700, margin: "0 0 8px" }, text: { color: "#374151" } }, elements: {}, customCSS: "" } },
    { id: "modern", name: "Modern", description: "Soft purple accents and card sections.", patch: { global: { backgroundColor: "#faf5ff", lineHeight: "1.6", padding: "10mm", sidebarBackgroundColor: "#f3e8ff", columnBorder: "1px solid #ddd6fe" }, selectors: { heading: { color: "#7c3aed", fontWeight: 800 }, section: { padding: "14px", borderRadius: "14px", backgroundColor: "#ffffff" } }, elements: {}, customCSS: "" } },
    { id: "classic", name: "Classic", description: "Traditional black and white layout.", patch: { global: { backgroundColor: "#ffffff", lineHeight: "1.5", padding: "10mm" }, selectors: { heading: { color: "#111827", fontWeight: 700, border: "0 solid #d1d5db", borderBottom: "1px solid #d1d5db", padding: "0 0 4px" } }, elements: {}, customCSS: "" } },
];

const walkSchema = (node: Schema, items: Schema[] = []) => {
    items.push(node);
    node.children?.forEach((child) => walkSchema(child, items));
    return items;
};

const cleanStyle = (style: StyleObject) => Object.fromEntries(Object.entries(style).filter(([, value]) => value !== "" && value !== undefined && value !== null)) as StyleObject;

export default function StylesPanel() {
    const { style, setStyle, sections, selectedNodeId } = useResumeBuilder();
    const nodes = useMemo(() => sections.flatMap((section) => walkSchema(section.schema).map((node) => ({ ...node, sectionName: section.name }))), [sections]);
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    const [target, setTarget] = useState<StyleTarget>("element");
    const [selectorKey, setSelectorKey] = useState("heading");
    const elementKey = selectedNode?.id ?? "";


    const activeStyle = target === "global" ? style.global : target === "selector" ? style.selectors?.[selectorKey] ?? {} : style.elements?.[elementKey] ?? {};
    const visibleFields = target === "global" ? globalFields : generalFields;

    const updateActiveStyle = (patch: StyleObject) => {
        setStyle((previous) => {
            if (target === "global") return { ...previous, global: cleanStyle({ ...previous.global, ...patch }) };
            if (target === "selector") return { ...previous, selectors: { ...previous.selectors, [selectorKey]: cleanStyle({ ...(previous.selectors?.[selectorKey] ?? {}), ...patch }) } };
            if (!elementKey) return previous;
            return { ...previous, elements: { ...previous.elements, [elementKey]: cleanStyle({ ...(previous.elements?.[elementKey] ?? {}), ...patch }) } };
        });
    };

    const removeActiveStyle = () => {
        setStyle((previous) => {
            if (target === "global") return { ...previous, global: {} };
            if (target === "selector") {
                const selectors = { ...previous.selectors };
                delete selectors[selectorKey];
                return { ...previous, selectors };
            }
            const elements = { ...previous.elements };
            delete elements[elementKey];
            return { ...previous, elements };
        });
    };

    const activeLabel = target === "global" ? "Global page" : target === "selector" ? selectorGroups.find((group) => group.key === selectorKey)?.label : selectedNode ? `${selectedNode.name} (${selectedNode.sectionName})` : "No element selected";

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Resume Style</h3>
                        <p className="mt-1 text-sm text-gray-500">Choose a simple level: global page, reusable element type, or click an item on the canvas to style that exact element.</p>
                    </div>
                    <button onClick={() => setStyle(emptyStyle)} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                        <FiRefreshCw /> Reset all
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {presets.map((preset) => (
                    <button key={preset.id} onClick={() => setStyle((previous) => ({ ...previous, ...preset.patch }))} className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md">
                        <p className="font-semibold text-gray-900">{preset.name}</p>
                        <p className="mt-1 text-sm text-gray-500">{preset.description}</p>
                    </button>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                <div className="space-y-4 rounded-2xl bg-white p-6 shadow-lg">
                    <h4 className="flex items-center gap-2 font-semibold text-gray-900"><FiSliders /> Style level</h4>
                    <div className="grid gap-2">
                        {(["global", "selector", "element"] as StyleTarget[]).map((item) => (
                            <button key={item} onClick={() => setTarget(item)} className={`cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium capitalize ${target === item ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                                {item === "global" ? "Global container" : item === "selector" ? "Element types" : "Clicked canvas element"}
                            </button>
                        ))}
                    </div>

                    {target === "selector" && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-700">Apply to every matching type</p>
                            <div className="grid grid-cols-2 gap-2">
                                {selectorGroups.map((group) => <button key={group.key} onClick={() => setSelectorKey(group.key)} title={group.description} className={`cursor-pointer rounded-lg border px-3 py-2 text-left text-sm ${selectorKey === group.key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>{group.label}</button>)}
                            </div>
                        </div>
                    )}

                    {target === "element" && (
                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            {selectedNode ? <>Editing <strong>{selectedNode.name}</strong>. To choose another element, click it directly on the canvas.</> : "Click any element in the canvas to style it here."}
                        </div>
                    )}

                    <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                        Current style: <strong>{activeLabel}</strong>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <div className="mb-5 flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Simple controls</h4>
                        <button onClick={removeActiveStyle} disabled={target === "element" && !elementKey} className="cursor-pointer rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">Clear this level</button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {visibleFields.map((field) => {
                            const value = activeStyle[field.key] ?? "";
                            return (
                                <label key={field.key} className="block text-sm font-medium text-gray-700">
                                    {field.label}
                                    <input
                                        type={field.type === "color" ? "color" : field.type}
                                        value={field.type === "color" && !value ? "#000000" : String(value)}
                                        placeholder={field.placeholder}
                                        onChange={(event) => updateActiveStyle({ [field.key]: field.type === "number" ? Number(event.target.value) : event.target.value })}
                                        disabled={target === "element" && !elementKey}
                                        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 disabled:bg-gray-100"
                                    />
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
