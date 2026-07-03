"use client";

import { useMemo, useState } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { Schema } from "@/types/resume/Section";
import { FiRefreshCw, FiSliders } from "react-icons/fi";

type StyleTarget = "global" | "selector" | "element";
type StyleField = keyof Pick<StyleObject, "color" | "backgroundColor" | "fontSize" | "fontWeight" | "lineHeight" | "marginBottom" | "padding" | "borderRadius">;

const emptyStyle: ResumeStyle = { global: {}, selectors: {}, elements: {}, customCSS: "" };

const fields: { key: StyleField; label: string; type: "color" | "text" | "number"; placeholder?: string }[] = [
    { key: "color", label: "Text color", type: "color" },
    { key: "backgroundColor", label: "Background", type: "color" },
    { key: "fontSize", label: "Font size", type: "number", placeholder: "14" },
    { key: "fontWeight", label: "Font weight", type: "text", placeholder: "400 / 600 / bold" },
    { key: "lineHeight", label: "Line height", type: "text", placeholder: "1.5 / 22px" },
    { key: "marginBottom", label: "Bottom space", type: "text", placeholder: "8px" },
    { key: "padding", label: "Padding", type: "text", placeholder: "12px" },
    { key: "borderRadius", label: "Radius", type: "text", placeholder: "8px" },
];

const presets: { id: string; name: string; description: string; patch: ResumeStyle }[] = [
    {
        id: "clean",
        name: "Clean",
        description: "Simple readable resume with blue section titles.",
        patch: {
            global: { fontFamily: "Inter, Arial, sans-serif", color: "#1f2937", backgroundColor: "#ffffff", fontSize: 14, lineHeight: "1.55" },
            selectors: { heading: { color: "#1d4ed8", fontWeight: 700, marginBottom: "8px" }, text: { color: "#374151" } },
            elements: {},
            customCSS: "",
        },
    },
    {
        id: "modern",
        name: "Modern",
        description: "Soft purple accents and comfortable spacing.",
        patch: {
            global: { fontFamily: "Inter, Arial, sans-serif", color: "#312e81", backgroundColor: "#faf5ff", fontSize: 14, lineHeight: "1.6" },
            selectors: { heading: { color: "#7c3aed", fontWeight: 800 }, section: { padding: "14px", borderRadius: "14px", backgroundColor: "#ffffff" } },
            elements: {},
            customCSS: "",
        },
    },
    {
        id: "classic",
        name: "Classic",
        description: "Traditional black and white layout.",
        patch: {
            global: { fontFamily: "Georgia, serif", color: "#111827", backgroundColor: "#ffffff", fontSize: 13, lineHeight: "1.5" },
            selectors: { heading: { color: "#111827", fontWeight: 700, borderBottom: "1px solid #d1d5db", paddingBottom: "4px" } },
            elements: {},
            customCSS: "",
        },
    },
];

const walkSchema = (node: Schema, items: Schema[] = []) => {
    items.push(node);
    node.children?.forEach((child) => walkSchema(child, items));
    return items;
};

const cleanStyle = (style: StyleObject) => Object.fromEntries(Object.entries(style).filter(([, value]) => value !== "" && value !== undefined && value !== null)) as StyleObject;

export default function StylesPanel() {
    const { style, setStyle, sections, selectedNodeId, setSelectedNodeId } = useResumeBuilder();
    const nodes = useMemo(() => sections.flatMap((section) => walkSchema(section.schema).map((node) => ({ ...node, sectionName: section.name }))), [sections]);
    const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? nodes[0];
    const selectorGroups = useMemo(() => Array.from(new Set(nodes.map((node) => node.selectorGroup || node.tag).filter(Boolean))).sort(), [nodes]);

    const [target, setTarget] = useState<StyleTarget>("global");
    const [selectorKey, setSelectorKey] = useState(selectorGroups[0] ?? "heading");
    const elementKey = selectedNode?.id ?? "";

    const activeKey = target === "selector" ? selectorKey : target === "element" ? elementKey : "global";
    const activeStyle = target === "global" ? style.global : target === "selector" ? style.selectors?.[selectorKey] ?? {} : style.elements?.[elementKey] ?? {};

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

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Resume Styles</h3>
                        <p className="mt-1 text-sm text-gray-500">Edit global styles, selector groups for similar elements, or the selected schema element by ID.</p>
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

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-4 rounded-2xl bg-white p-6 shadow-lg">
                    <h4 className="flex items-center gap-2 font-semibold text-gray-900"><FiSliders /> Target</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {(["global", "selector", "element"] as StyleTarget[]).map((item) => (
                            <button key={item} onClick={() => setTarget(item)} className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium capitalize ${target === item ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{item}</button>
                        ))}
                    </div>

                    {target === "selector" && (
                        <label className="block text-sm font-medium text-gray-700">
                            Selector group
                            <select value={selectorKey} onChange={(event) => setSelectorKey(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2">
                                {selectorGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                            </select>
                        </label>
                    )}

                    {target === "element" && (
                        <label className="block text-sm font-medium text-gray-700">
                            Element ID from schema
                            <select value={elementKey} onChange={(event) => setSelectedNodeId(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2">
                                {nodes.map((node) => <option key={node.id} value={node.id}>{node.name} ({node.id})</option>)}
                            </select>
                        </label>
                    )}

                    <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                        Current target: <strong>{activeKey}</strong>. Selector styles apply to every schema node with the same <code>selectorGroup</code>; element styles are stored by node <code>id</code> and override selector styles.
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <div className="mb-5 flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Style controls</h4>
                        <button onClick={removeActiveStyle} className="cursor-pointer rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100">Clear target</button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {fields.map((field) => {
                            const value = activeStyle[field.key] ?? "";
                            return (
                                <label key={field.key} className="block text-sm font-medium text-gray-700">
                                    {field.label}
                                    <input
                                        type={field.type === "number" ? "number" : field.type}
                                        value={field.type === "color" && !value ? "#000000" : String(value)}
                                        placeholder={field.placeholder}
                                        onChange={(event) => updateActiveStyle({ [field.key]: field.type === "number" ? Number(event.target.value) : event.target.value })}
                                        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                                    />
                                </label>
                            );
                        })}
                    </div>
                    <label className="mt-4 block text-sm font-medium text-gray-700">
                        Custom CSS for the canvas
                        <textarea value={style.customCSS ?? ""} onChange={(event) => setStyle((previous) => ({ ...previous, customCSS: event.target.value }))} rows={5} className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm text-gray-900" placeholder="#resume .resume-section { ... }" />
                    </label>
                </div>
            </div>
        </div>
    );
}
