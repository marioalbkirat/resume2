"use client";

import { useState } from "react";
import { FiAlignCenter, FiAlignJustify, FiAlignLeft, FiAlignRight, FiRefreshCw, FiSquare } from "react-icons/fi";
import { ColorTarget, VisualGroup, fonts, numberValue, selectorGroups, useVisualStylesPanel, withPx } from "@/hooks/useVisualStylesPanel";
import { StyleObject } from "@/types/resume/ResumeStyle";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const titleClass = "mb-4 flex items-center justify-between text-base font-bold text-slate-900";
const pageWidths = { A4: 210, LETTER: 215.9 } as const;
const borderStyles = [
  { label: "No border", value: "none" },
  { label: "Solid", value: "solid" },
  { label: "Soft dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
] as const;
const spacingSides = [
  { label: "Top", key: "Top" },
  { label: "Right", key: "Right" },
  { label: "Bottom", key: "Bottom" },
  { label: "Left", key: "Left" },
] as const;
const borderSides = [
  { label: "All", key: "" },
  { label: "Top", key: "Top" },
  { label: "Right", key: "Right" },
  { label: "Bottom", key: "Bottom" },
  { label: "Left", key: "Left" },
] as const;
type PanelTab = "global" | "elements" | "selectors";

function MiniButton({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${active ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}>{children}</button>;
}

function Slider({ label, value, min, max, onChange, preview }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; preview?: React.ReactNode }) {
  return <label className="block rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"><span className="flex items-center justify-between"><span>{label}</span>{preview}</span><input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-blue-600" /></label>;
}

function ColorControl({ label, target, colors }: { label: string; target: ColorTarget; colors: Pick<ReturnType<typeof useVisualStylesPanel>, "setColor" | "valueFor"> }) {
  const current = colors.valueFor(target);
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(current) ? current : "#000000";
  return <div className="rounded-xl bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-slate-700">{label}</span><span className="h-7 w-12 rounded-lg border border-slate-200" style={{ backgroundColor: current }} /></div><div className="grid grid-cols-[56px_1fr] gap-2"><input type="color" value={pickerValue} onChange={(event) => colors.setColor(target, event.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white" /><input value={current} onChange={(event) => colors.setColor(target, event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-blue-500" /></div></div>;
}


function SideSlider({ label, value, onChange, max = 48 }: { label: string; value: string | number | undefined; onChange: (value: number) => void; max?: number }) {
  const numericValue = numberValue(value, 0);
  return <Slider label={label} min={0} max={max} value={numericValue} onChange={onChange} preview={<span>{numericValue}px</span>} />;
}

function SpacingControl({ label, property, current, update }: { label: string; property: "padding" | "margin"; current: StyleObject; update: (patch: StyleObject) => void }) {
  return <div className="space-y-2 rounded-xl bg-slate-50 p-3"><p className="text-sm font-black text-slate-700">{label}</p><div className="grid grid-cols-2 gap-2">{spacingSides.map((side) => {
    const key = `${property}${side.key}`;
    return <SideSlider key={key} label={side.label} value={current[key] ?? current[property]} onChange={(value) => update({ [key]: withPx(value) })} />;
  })}</div></div>;
}

function BoxBorderControl({ current, update }: { current: StyleObject; update: (patch: StyleObject) => void }) {
  return <div className="space-y-3 rounded-xl bg-slate-50 p-3"><p className="text-sm font-black text-slate-700">Border</p>{borderSides.map((side) => {
    const prefix = side.key ? `border${side.key}` : "border";
    const widthKey = `${prefix}Width`;
    const styleKey = `${prefix}Style`;
    const colorKey = `${prefix}Color`;
    const width = current[widthKey] ?? (!side.key ? undefined : current.borderWidth);
    const styleValue = current[styleKey] ?? (!side.key ? undefined : current.borderStyle);
    const colorValue = String(current[colorKey] ?? (!side.key ? current.borderColor : current.borderColor) ?? "#111827");
    const pickerValue = /^#[0-9a-fA-F]{6}$/.test(colorValue) ? colorValue : "#111827";
    return <div key={side.label} className="rounded-xl border border-slate-200 bg-white p-3"><p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">{side.label}</p><div className="grid grid-cols-2 gap-2"><SideSlider label="Width" value={width} max={12} onChange={(value) => update({ [widthKey]: withPx(value) })} />{renderBorderStyleSelect(styleValue, (value) => update({ [styleKey]: value }))}</div><div className="mt-2 grid grid-cols-[56px_1fr] gap-2"><input type="color" value={pickerValue} onChange={(event) => update({ [colorKey]: event.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white" /><input value={colorValue} onChange={(event) => update({ [colorKey]: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-blue-500" /></div></div>;
  })}</div>;
}

function renderBorderStyleSelect(value: string | number | undefined, onChange: (value: string) => void) {
  return <label className="block rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"><span className="mb-2 block">Style</span><select value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"><option value="">Default</option>{borderStyles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function parseColumnBorder(value?: string | number) {
  const text = String(value ?? "1px solid #e5e7eb");
  const width = Number.parseFloat(text) || 1;
  const style = borderStyles.find((item) => text.includes(item.value))?.value ?? "solid";
  const color = text.match(/#[0-9a-fA-F]{6}/)?.[0] ?? "#e5e7eb";
  return { width, style, color };
}

function columnBorderValue(width: number, style: string, color: string) {
  return style === "none" || width === 0 ? "" : `${width}px ${style} ${color}`;
}

function BorderControl({ value, onChange }: { value?: string | number; onChange: (value: string) => void }) {
  const border = parseColumnBorder(value);
  const setBorder = (patch: Partial<typeof border>) => {
    const next = { ...border, ...patch };
    onChange(columnBorderValue(next.width, next.style, next.color));
  };

  return <div className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"><div className="mb-3 flex items-center justify-between"><span>Vertical divider</span><span className="h-8 w-12 rounded-lg bg-white" style={{ borderLeft: columnBorderValue(border.width, border.style, border.color) || "1px solid transparent" }} /></div><div className="grid grid-cols-2 gap-2">{borderStyles.map((item) => <MiniButton key={item.value} active={border.style === item.value || (item.value === "none" && !value)} onClick={() => setBorder({ style: item.value })}>{item.label}</MiniButton>)}</div><Slider label="Divider thickness" min={0} max={8} value={border.width} onChange={(width) => setBorder({ width })} preview={<span>{border.width}px</span>} /><div className="mt-3 grid grid-cols-[56px_1fr] gap-2"><input type="color" value={border.color} onChange={(event) => setBorder({ color: event.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white" /><span className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">Choose divider color</span></div></div>;
}

function Alignment({ active, onChange }: { active?: string | number; onChange: (patch: StyleObject) => void }) {
  return <div className="grid grid-cols-4 gap-2"><MiniButton active={active === "left"} onClick={() => onChange({ textAlign: "left" })}><FiAlignLeft className="mx-auto" /></MiniButton><MiniButton active={active === "center"} onClick={() => onChange({ textAlign: "center" })}><FiAlignCenter className="mx-auto" /></MiniButton><MiniButton active={active === "right"} onClick={() => onChange({ textAlign: "right" })}><FiAlignRight className="mx-auto" /></MiniButton><MiniButton active={active === "justify"} onClick={() => onChange({ textAlign: "justify" })}><FiAlignJustify className="mx-auto" /></MiniButton></div>;
}

export default function StylesPanel() {
  const controls = useVisualStylesPanel();
  const { style, settings, selectedNode, selectedGroup, updateGlobal, updateSelector, updateElement, resetStyles } = controls;
  const [tab, setTab] = useState<PanelTab>("global");
  const [selector, setSelector] = useState<VisualGroup>("section");
  const selectedPatch = style.elements?.[selectedNode?.id ?? ""] ?? {};
  const pageWidth = pageWidths[settings.pageSize];
  const leftColumnWidth = numberValue(style.global?.leftColumnWidth, settings.pageSize === "A4" ? 70 : 72);
  const rightColumnWidth = Math.max(0, Number((pageWidth - leftColumnWidth).toFixed(1)));
  const updateLeftColumn = (value: number) => updateGlobal({ leftColumnWidth: `${value}mm`, rightColumnWidth: `${Number((pageWidth - value).toFixed(1))}mm` });
  const updateRightColumn = (value: number) => updateGlobal({ leftColumnWidth: `${Number((pageWidth - value).toFixed(1))}mm`, rightColumnWidth: `${value}mm` });

  const renderSelect = (label: string, value: string | number | undefined, options: { label: string; value: string }[], onChange: (value: string) => void) => <label className="block rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"><span className="mb-2 block">{label}</span><select value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"><option value="">Default</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;

  const renderCommonControls = (scope: "selector" | "element", target: string, current: StyleObject, update: (patch: StyleObject) => void) => <div className="space-y-3 rounded-2xl border border-slate-100 p-3"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Common box styles</p><SpacingControl label="Padding" property="padding" current={current} update={update} /><SpacingControl label="Margin" property="margin" current={current} update={update} /><ColorControl colors={controls} label="Background" target={{ scope, target, key: "backgroundColor", label: "Background" }} /><Slider label="Border radius" min={0} max={120} value={numberValue(current.borderRadius, 0)} onChange={(value) => update({ borderRadius: withPx(value) })} /><BoxBorderControl current={current} update={update} /></div>;

  const renderTypographyControls = (scope: "selector" | "element", target: string, current: StyleObject, update: (patch: StyleObject) => void, group: string) => <div className="space-y-3 rounded-2xl border border-slate-100 p-3"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Typography</p><ColorControl colors={controls} label="Text color" target={{ scope, target, key: "color", label: "Text color" }} /><div className="grid grid-cols-2 gap-2">{fonts.map((font) => <MiniButton key={font.id} active={current.fontFamily === font.value} onClick={() => update({ fontFamily: font.value })}><span style={{ fontFamily: font.value }}>Aa {font.name}</span></MiniButton>)}</div><Slider label="Font size" min={8} max={72} value={numberValue(current.fontSize, group === "heading" ? 22 : 14)} onChange={(value) => update({ fontSize: withPx(value) })} preview={<span style={{ fontSize: numberValue(current.fontSize, 16) }}>Aa</span>} /><div className="grid grid-cols-3 gap-2"><MiniButton active={current.fontWeight === 300} onClick={() => update({ fontWeight: 300 })}>Light</MiniButton><MiniButton active={current.fontWeight === 400} onClick={() => update({ fontWeight: 400 })}>Normal</MiniButton><MiniButton active={current.fontWeight === 700} onClick={() => update({ fontWeight: 700 })}>Bold</MiniButton></div>{renderSelect("Font style", current.fontStyle, [{ label: "Normal", value: "normal" }, { label: "Italic", value: "italic" }, { label: "Oblique", value: "oblique" }], (value) => update({ fontStyle: value }))}<Alignment active={current.textAlign} onChange={update} />{renderSelect("Transform", current.textTransform, [{ label: "None", value: "none" }, { label: "Uppercase", value: "uppercase" }, { label: "Lowercase", value: "lowercase" }, { label: "Capitalize", value: "capitalize" }], (value) => update({ textTransform: value }))}<Slider label="Line height" min={8} max={32} value={numberValue(current.lineHeight, 1.5) * 10} onChange={(value) => update({ lineHeight: value / 10 })} /><div className="grid grid-cols-2 gap-2"><Slider label="Letter spacing" min={-5} max={20} value={numberValue(current.letterSpacing, 0)} onChange={(value) => update({ letterSpacing: withPx(value) })} /><Slider label="Word spacing" min={0} max={30} value={numberValue(current.wordSpacing, 0)} onChange={(value) => update({ wordSpacing: withPx(value) })} /></div></div>;

  const renderFlexControls = (current: StyleObject, update: (patch: StyleObject) => void) => <div className="space-y-3 rounded-2xl border border-slate-100 p-3"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Flex layout</p><div className="grid grid-cols-2 gap-2"><MiniButton active={current.display === "flex" && current.flexDirection === "column"} onClick={() => update({ display: "flex", flexDirection: "column" })}>⬇ Vertical</MiniButton><MiniButton active={current.display === "flex" && current.flexDirection === "row"} onClick={() => update({ display: "flex", flexDirection: "row" })}>➡ Horizontal</MiniButton></div><Slider label="Gap" min={0} max={48} value={numberValue(current.gap, 12)} onChange={(value) => update({ gap: withPx(value) })} /><div className="grid grid-cols-2 gap-2">{renderSelect("Justify", current.justifyContent, [{ label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }, { label: "Between", value: "space-between" }, { label: "Around", value: "space-around" }], (value) => update({ justifyContent: value }))}{renderSelect("Align", current.alignItems, [{ label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }, { label: "Stretch", value: "stretch" }], (value) => update({ alignItems: value }))}</div></div>;

  const renderSmartControls = (scope: "selector" | "element", target: string, current: StyleObject, update: (patch: StyleObject) => void, group: string = selectedGroup) => <div className="space-y-3">
    {(group === "heading" || group === "paragraph" || group === "text" || group === "link") && renderTypographyControls(scope, target, current, update, group)}
    {group === "link" && <div className="space-y-3 rounded-2xl border border-slate-100 p-3"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Link styles</p><ColorControl colors={controls} label="Hover/accent color" target={{ scope, target, key: "--link-accent-color", label: "Link accent" }} />{renderSelect("Cursor", current.cursor, [{ label: "Pointer", value: "pointer" }, { label: "Default", value: "default" }, { label: "Text", value: "text" }], (value) => update({ cursor: value }))}</div>}
    {group === "image" && <div className="space-y-3 rounded-2xl border border-slate-100 p-3"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Image</p><div className="grid grid-cols-2 gap-2"><Slider label="Width" min={24} max={360} value={numberValue(current.width, 96)} onChange={(value) => update({ width: withPx(value) })} /><Slider label="Height" min={24} max={360} value={numberValue(current.height, 96)} onChange={(value) => update({ height: withPx(value) })} /></div><Slider label="Image radius" min={0} max={180} value={numberValue(current.borderRadius, 0)} onChange={(value) => update({ borderRadius: withPx(value) })} />{renderSelect("Object fit", current.objectFit, [{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }, { label: "Scale down", value: "scale-down" }, { label: "None", value: "none" }], (value) => update({ objectFit: value }))}</div>}
    {group === "icon" && <>{renderTypographyControls(scope, target, current, update, group)}<div className="space-y-3 rounded-2xl border border-slate-100 p-3"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Icon</p><Slider label="Icon size" min={8} max={96} value={numberValue(current.fontSize, 20)} onChange={(value) => update({ fontSize: withPx(value) })} /></div></>}
    {(group === "list" || group === "container" || group === "section") && renderFlexControls(current, update)}
    {(group === "list" || group === "listItem") && <div className="space-y-3 rounded-2xl border border-slate-100 p-3"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">List</p><div className="grid grid-cols-4 gap-2"><MiniButton active={current.listStyleType === "disc"} onClick={() => update({ listStyleType: "disc", display: group === "listItem" ? "list-item" : current.display })}>•</MiniButton><MiniButton active={current.listStyleType === "'✓ '"} onClick={() => update({ listStyleType: "'✓ '", display: group === "listItem" ? "list-item" : current.display })}>✓</MiniButton><MiniButton active={current.listStyleType === "'— '"} onClick={() => update({ listStyleType: "'— '", display: group === "listItem" ? "list-item" : current.display })}>—</MiniButton><MiniButton active={current.listStyleType === "none"} onClick={() => update({ listStyleType: "none" })}>None</MiniButton></div><ColorControl colors={controls} label="Text color" target={{ scope, target, key: "color", label: "Text color" }} /></div>}
    {renderCommonControls(scope, target, current, update)}
  </div>;

  return <div className="space-y-4"><div className={cardClass}><h3 className="text-xl font-black text-slate-950">Style Panel</h3><div className="mt-4 grid grid-cols-3 gap-2">{(["global", "elements", "selectors"] as PanelTab[]).map((item) => <MiniButton key={item} active={tab === item} onClick={() => setTab(item)}>{item}</MiniButton>)}</div></div>
    {tab === "global" && <div className={cardClass}><h4 className={titleClass}>Global resume container</h4><div className="space-y-3"><div className="grid grid-cols-2 gap-2">{fonts.map((font) => <MiniButton key={font.id} active={style.global?.fontFamily === font.value} onClick={() => updateGlobal({ fontFamily: font.value })}><span style={{ fontFamily: font.value }}>{font.name}</span></MiniButton>)}</div>{settings.columns === "ONE" && <ColorControl colors={controls} label="Page background" target={{ scope: "global", key: "backgroundColor", label: "Global background" }} />}<Slider label="Page padding" min={0} max={30} value={numberValue(style.global?.padding, 0)} onChange={(value) => updateGlobal({ padding: `${value}mm` })} preview={<span>{numberValue(style.global?.padding, 0)}mm</span>} />{settings.columns === "TWO" && <div className="rounded-xl border border-slate-200 p-3"><p className="mb-1 text-sm font-bold text-slate-700">Two-column layout</p><p className="mb-3 text-xs font-semibold text-slate-500">Columns always add up to {settings.pageSize} width ({pageWidth}mm).</p><Slider label="Left column width" min={40} max={Math.floor(pageWidth - 40)} value={leftColumnWidth} onChange={updateLeftColumn} preview={<span>{leftColumnWidth}mm</span>} /><Slider label="Right column width" min={40} max={Math.floor(pageWidth - 40)} value={rightColumnWidth} onChange={updateRightColumn} preview={<span>{rightColumnWidth}mm</span>} /><div className="mt-3 grid grid-cols-2 gap-3"><ColorControl colors={controls} label="Left color" target={{ scope: "global", key: "sidebarBackgroundColor", label: "Left column color" }} /><ColorControl colors={controls} label="Right color" target={{ scope: "global", key: "mainBackgroundColor", label: "Right column color" }} /></div><div className="mt-3"><BorderControl value={style.global?.columnBorder} onChange={(value) => updateGlobal({ columnBorder: value })} /></div></div>}</div></div>}
    {tab === "selectors" && <div className={cardClass}><h4 className={titleClass}>Selectors</h4><div className="mb-4 grid grid-cols-2 gap-2">{selectorGroups.map((item) => <MiniButton key={item} active={selector === item} onClick={() => setSelector(item)}>{item}</MiniButton>)}</div>{renderSmartControls("selector", selector, style.selectors?.[selector] ?? {}, (patch) => updateSelector(selector, patch), selector)}</div>}
    {tab === "elements" && <div className={cardClass}><h4 className={titleClass}>Active element</h4><p className="mb-4 text-sm text-slate-500">{selectedNode ? `${selectedNode.name} (${selectedGroup})` : "Click any element in the canvas first."}</p>{selectedNode ? renderSmartControls("element", selectedNode.id, selectedPatch, updateElement, selectedGroup) : <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400"><FiSquare className="mx-auto mb-2" />No active element</div>}</div>}
    <div className="sticky bottom-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur"><button onClick={resetStyles} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700 hover:bg-slate-200"><FiRefreshCw />Reset</button></div></div>;
}
