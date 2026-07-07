"use client";

import React, { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiAlignCenter, FiAlignLeft, FiAlignRight, FiBold, FiChevronDown, FiItalic, FiMinus, FiPlus } from "react-icons/fi";
import { fonts, numberValue, useVisualStylesPanel, withPx } from "@/hooks/useVisualStylesPanel";
import { StyleObject } from "@/types/resume/ResumeStyle";

type FloatingElementStyleBarProps = { canvasRef: RefObject<HTMLDivElement | null> };
type BarPosition = { left: number; top: number };
type DragState = { pointerId: number; offsetX: number; offsetY: number };
type PointerLikeEvent = React.PointerEvent<HTMLElement>;
type ManualBarPosition = BarPosition & { nodeId: string };

const buttonClass = "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700";
const activeButtonClass = "border-blue-500 bg-blue-50 text-blue-700";
const inputClass = "h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500";

function compactFontName(value?: string | number) {
  return fonts.find((font) => font.value === value)?.name ?? "Font";
}

function NumberStepper({ label, value, fallback, min, max, unit = "px", onChange }: { label: string; value?: string | number; fallback: number; min: number; max: number; unit?: string; onChange: (value: number) => void }) {
  const current = numberValue(value, fallback);
  const [draftValue, setDraftValue] = useState<string | null>(null);
  const displayedValue = draftValue ?? `${current}${unit}`;
  const setNext = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  const commitDraftValue = (nextDraftValue = displayedValue) => {
    const parsedValue = Number.parseFloat(nextDraftValue);

    if (Number.isNaN(parsedValue)) {
      setDraftValue(null);
      return;
    }

    const nextValue = Math.min(max, Math.max(min, parsedValue));
    setDraftValue(null);
    onChange(nextValue);
  };

  return <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1" aria-label={label} title={label}>
    <button type="button" className={buttonClass} onClick={() => setNext(current - 1)} aria-label={`Decrease ${label}`} title={`Decrease ${label}`}><FiMinus /></button>
    <input
      type="text"
      inputMode="decimal"
      value={displayedValue}
      onChange={(event) => setDraftValue(event.target.value)}
      onFocus={() => setDraftValue(`${current}${unit}`)}
      onBlur={() => commitDraftValue()}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      className="h-9 w-16 rounded-xl border border-transparent bg-transparent px-1 text-center text-xs font-black text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white focus:text-slate-900"
      aria-label={`${label} value`}
      title={`${label} value`}
    />
    <button type="button" className={buttonClass} onClick={() => setNext(current + 1)} aria-label={`Increase ${label}`} title={`Increase ${label}`}><FiPlus /></button>
  </div>;
}

const withPercent = (value: string | number) => `${value}%`;

type SpacingField = { label: string; key: string };
type BorderSideField = { label: string; borderKey: string; widthKey: string; styleKey: string; colorKey: string };

const spacingFields: SpacingField[] = [
  { label: "Top", key: "Top" },
  { label: "Right", key: "Right" },
  { label: "Bottom", key: "Bottom" },
  { label: "Left", key: "Left" },
];

const borderSideFields: BorderSideField[] = [
  { label: "Top", borderKey: "borderTop", widthKey: "borderTopWidth", styleKey: "borderTopStyle", colorKey: "borderTopColor" },
  { label: "Right", borderKey: "borderRight", widthKey: "borderRightWidth", styleKey: "borderRightStyle", colorKey: "borderRightColor" },
  { label: "Bottom", borderKey: "borderBottom", widthKey: "borderBottomWidth", styleKey: "borderBottomStyle", colorKey: "borderBottomColor" },
  { label: "Left", borderKey: "borderLeft", widthKey: "borderLeftWidth", styleKey: "borderLeftStyle", colorKey: "borderLeftColor" },
];

const radiusFields: SpacingField[] = [
  { label: "All corners", key: "" },
  { label: "Top left", key: "TopLeft" },
  { label: "Top right", key: "TopRight" },
  { label: "Bottom right", key: "BottomRight" },
  { label: "Bottom left", key: "BottomLeft" },
];
const radiusCornerKeys = radiusFields.filter((field) => field.key).map((field) => `border${field.key}Radius`);

const borderStyles = [
  { label: "No line", value: "none" },
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "Double", value: "double" },
];

const displayOptions = [
  { label: "Flex", value: "flex" },
  { label: "Block", value: "block" },
];

const flexDirectionOptions = [
  { label: "Row", value: "row" },
  { label: "Column", value: "column" },
];

const justifyContentOptions = [
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Between", value: "space-between" },
  { label: "Around", value: "space-around" },
  { label: "Evenly", value: "space-evenly" },
];

const alignItemsOptions = [
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Stretch", value: "stretch" },
  { label: "Baseline", value: "baseline" },
];

const alignContentOptions = [
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Stretch", value: "stretch" },
  { label: "Between", value: "space-between" },
  { label: "Around", value: "space-around" },
];

function DropdownPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return <details className="group relative" onPointerDown={(event) => event.stopPropagation()}>
    <summary className={`${buttonClass} cursor-pointer list-none gap-2 [&::-webkit-details-marker]:hidden`}>
      {label}
      <FiChevronDown className="transition group-open:rotate-180" />
    </summary>
    <div className="absolute left-0 top-11 z-10 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15">
      <div className="grid gap-2">{children}</div>
    </div>
  </details>;
}

function SelectControl({ label, value, options, onChange, className = "w-32" }: { label: string; value?: string | number; options: { label: string; value: string }[]; onChange: (value: string) => void; className?: string }) {
  return <select value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className={`${inputClass} ${className}`} aria-label={label} title={label}>
    <option value="">{label}</option>
    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>;
}

function BorderSideControls({ field, current, patch }: { field: BorderSideField; current: StyleObject; patch: (next: StyleObject) => void }) {
  const width = numberValue(current[field.widthKey] ?? current[field.borderKey], 0);
  const style = String(current[field.styleKey] ?? (width > 0 ? "solid" : "none"));
  const color = String(current[field.colorKey] ?? "#111827");
  const updateBorder = (nextWidth = width, nextStyle = style, nextColor = color) => patch({
    [field.widthKey]: withPx(nextWidth),
    [field.styleKey]: nextStyle,
    [field.colorKey]: nextColor,
    [field.borderKey]: nextStyle === "none" || nextWidth === 0 ? "0 solid transparent" : `${nextWidth}px ${nextStyle} ${nextColor}`,
  });

  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
    <div className="mb-2 text-xs font-black text-slate-600">{field.label}</div>
    <div className="flex flex-wrap items-center gap-2">
      <NumberStepper label={`${field.label} border width`} value={width} fallback={0} min={0} max={24} onChange={(value) => updateBorder(value)} />
      <select value={style} onChange={(event) => updateBorder(width, event.target.value)} className={`${inputClass} w-28`} aria-label={`${field.label} border style`} title={`${field.label} border style`}>
        {borderStyles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <ColorInput label="Color" value={color} onChange={(value) => updateBorder(width, style === "none" ? "solid" : style, value)} />
    </div>
  </div>;
}

function ColorInput({ label, value, onChange }: { label: string; value?: string | number; onChange: (value: string) => void }) {
  const current = String(value ?? "#111827");
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(current) ? current : "#111827";

  return <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-500" title={label}>
    {label}
    <input type="color" value={pickerValue} onChange={(event) => onChange(event.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white" aria-label={label} title={label} />
  </label>;
}

export default function FloatingElementStyleBar({ canvasRef }: FloatingElementStyleBarProps) {
  const { selectedNode, selectedGroup, style, updateElement } = useVisualStylesPanel();
  const current = useMemo(() => style.elements?.[selectedNode?.id ?? ""] ?? {}, [selectedNode?.id, style.elements]);
  const [position, setPosition] = useState<BarPosition | null>(null);
  const [manualPosition, setManualPosition] = useState<ManualBarPosition | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedNode?.id) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const selectedElement = canvas.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(selectedNode.id)}"]`);
      if (!selectedElement) {
        setPosition(null);
        return;
      }

      const elementRect = selectedElement.getBoundingClientRect();
      const top = Math.max(12, elementRect.top - 72);
      const left = Math.min(Math.max(12, elementRect.left + elementRect.width / 2), window.innerWidth - 12);
      setPosition({ left, top });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    canvas.addEventListener("scroll", updatePosition, true);
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(canvas);

    return () => {
      window.removeEventListener("resize", updatePosition);
      canvas.removeEventListener("scroll", updatePosition, true);
      resizeObserver.disconnect();
    };
  }, [canvasRef, selectedNode?.id]);

  useEffect(() => {
    if (!dragState) return;

    const moveBar = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) return;

      const bar = barRef.current;
      const rect = bar?.getBoundingClientRect();
      const width = rect?.width ?? 0;
      const height = rect?.height ?? 0;
      const left = Math.min(Math.max(8, event.clientX - dragState.offsetX), Math.max(8, window.innerWidth - width - 8));
      const top = Math.min(Math.max(8, event.clientY - dragState.offsetY), Math.max(8, window.innerHeight - height - 8));
      if (selectedNode?.id) setManualPosition({ nodeId: selectedNode.id, left, top });
    };

    const stopDragging = (event: PointerEvent) => {
      if (event.pointerId === dragState.pointerId) setDragState(null);
    };

    window.addEventListener("pointermove", moveBar);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", moveBar);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [dragState, selectedNode?.id]);

  if (typeof document === "undefined" || !selectedNode || !position) return null;

  const isTextLike = ["heading", "paragraph", "text", "link", "icon", "list", "listItem"].includes(selectedGroup);
  const isImage = selectedGroup === "image";
  const isSection = selectedGroup === "section";
  const isLayout = ["section", "container", "list", "listItem"].includes(selectedGroup);
  const patch = (next: StyleObject) => updateElement(next);
  const imageRadiusValue = (key: string) => current[`border${key}Radius`] ?? current.borderRadius;
  const boxRadiusValue = (key: string) => current[`border${key}Radius`] ?? current.borderRadius;
  const updateImageRadius = (key: string, value: number) => {
    const nextRadius = withPercent(value);

    if (!key) {
      patch({
        borderRadius: nextRadius,
        ...Object.fromEntries(radiusCornerKeys.map((cornerKey) => [cornerKey, nextRadius])),
      });
      return;
    }

    patch({ [`border${key}Radius`]: nextRadius });
  };

  const updateBoxRadius = (key: string, value: number) => {
    const nextRadius = withPx(value);

    if (!key) {
      patch({
        borderRadius: nextRadius,
        ...Object.fromEntries(radiusCornerKeys.map((cornerKey) => [cornerKey, nextRadius])),
      });
      return;
    }

    patch({ [`border${key}Radius`]: nextRadius });
  };

  const startBarDrag = (event: PointerLikeEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, textarea, option")) return;

    event.preventDefault();
    event.stopPropagation();
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    setManualPosition({ nodeId: selectedNode.id, left: rect.left, top: rect.top });
    setDragState({ pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top });
  };

  const selectedManualPosition = manualPosition?.nodeId === selectedNode.id ? manualPosition : null;
  const displayedPosition = selectedManualPosition ?? position;
  const isManuallyPlaced = Boolean(selectedManualPosition);

  const bar = <div
    ref={barRef}
    data-floating-style-bar="true"
    className={`fixed z-[9999] max-w-[calc(100vw-1rem)] cursor-grab rounded-[1.35rem] border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-900/15 backdrop-blur active:cursor-grabbing ${isManuallyPlaced ? "" : "-translate-x-1/2"}`}
    style={{ left: displayedPosition.left, top: displayedPosition.top }}
    onPointerDown={startBarDrag}
    onClick={(event) => event.stopPropagation()}
    title="Drag style bar"
  >
    <div className="flex max-w-full flex-wrap items-center gap-2 overflow-visible px-1">
      <button
        type="button"
        className="inline-flex h-9 cursor-grab touch-none items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-black text-slate-500 active:cursor-grabbing"
        aria-label="Move style bar"
        title="Move style bar"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const rect = event.currentTarget.closest<HTMLElement>('[data-floating-style-bar="true"]')?.getBoundingClientRect();
          if (!rect) return;
          setManualPosition({ nodeId: selectedNode.id, left: rect.left, top: rect.top });
          setDragState({ pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top });
        }}
      >
        Move
      </button>
      <span className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black text-white">{selectedNode.name}</span>

      {isTextLike && <>
        <select value={String(current.fontFamily ?? "")} onChange={(event) => patch({ fontFamily: event.target.value })} className={`${inputClass} w-32`} aria-label="Font family" title="Font family">
          <option value="">{compactFontName(current.fontFamily)}</option>
          {fonts.map((font) => <option key={font.id} value={font.value}>{font.name}</option>)}
        </select>
        <NumberStepper label="Font size" value={current.fontSize} fallback={selectedGroup === "heading" ? 22 : 14} min={8} max={96} onChange={(value) => patch({ fontSize: withPx(value) })} />
        <button type="button" className={`${buttonClass} ${current.fontWeight === 700 ? activeButtonClass : ""}`} onClick={() => patch({ fontWeight: current.fontWeight === 700 ? 400 : 700 })} title="Bold"><FiBold /></button>
        <button type="button" className={`${buttonClass} ${current.fontStyle === "italic" ? activeButtonClass : ""}`} onClick={() => patch({ fontStyle: current.fontStyle === "italic" ? "normal" : "italic" })} title="Italic"><FiItalic /></button>
        <button type="button" className={`${buttonClass} ${current.textAlign === "left" ? activeButtonClass : ""}`} onClick={() => patch({ textAlign: "left" })} title="Align left"><FiAlignLeft /></button>
        <button type="button" className={`${buttonClass} ${current.textAlign === "center" ? activeButtonClass : ""}`} onClick={() => patch({ textAlign: "center" })} title="Align center"><FiAlignCenter /></button>
        <button type="button" className={`${buttonClass} ${current.textAlign === "right" ? activeButtonClass : ""}`} onClick={() => patch({ textAlign: "right" })} title="Align right"><FiAlignRight /></button>
        <ColorInput label="Text" value={current.color} onChange={(value) => patch({ color: value })} />
      </>}

      {isImage && <>
        <DropdownPanel label="Margin">
          {spacingFields.map((field) => <NumberStepper key={field.key} label={`Margin ${field.label}`} value={current[`margin${field.key}`]} fallback={numberValue(current.margin, 0)} min={0} max={120} onChange={(value) => patch({ [`margin${field.key}`]: withPx(value) })} />)}
        </DropdownPanel>
        <DropdownPanel label="Padding">
          {spacingFields.map((field) => <NumberStepper key={field.key} label={`Padding ${field.label}`} value={current[`padding${field.key}`]} fallback={numberValue(current.padding, 0)} min={0} max={120} onChange={(value) => patch({ [`padding${field.key}`]: withPx(value) })} />)}
        </DropdownPanel>
        <NumberStepper label="Image width" value={current.width} fallback={96} min={24} max={720} onChange={(value) => patch({ width: withPx(value) })} />
        <NumberStepper label="Image height" value={current.height} fallback={96} min={24} max={720} onChange={(value) => patch({ height: withPx(value) })} />
        <DropdownPanel label="Border radius">
          {radiusFields.map((field) => <NumberStepper key={field.key || "all"} label={`${field.label} radius`} value={imageRadiusValue(field.key)} fallback={numberValue(current.borderRadius, 0)} min={0} max={100} unit="%" onChange={(value) => updateImageRadius(field.key, value)} />)}
        </DropdownPanel>
        <DropdownPanel label="Border">
          {borderSideFields.map((field) => <BorderSideControls key={field.borderKey} field={field} current={current} patch={patch} />)}
        </DropdownPanel>
        <select value={String(current.objectFit ?? "")} onChange={(event) => patch({ objectFit: event.target.value })} className={`${inputClass} w-28`} aria-label="Object fit" title="Object fit">
          <option value="">Fit</option><option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option><option value="scale-down">Scale down</option><option value="none">None</option>
        </select>
      </>}

      {isLayout && <>
        {isSection && <SelectControl label="Display" value={current.display} options={displayOptions} onChange={(value) => patch({ display: value })} className="w-28" />}
        <button type="button" className={`${buttonClass} ${current.display === "flex" && current.flexDirection === "row" ? activeButtonClass : ""}`} onClick={() => patch({ display: "flex", flexDirection: "row" })} title="Row layout">Row</button>
        <button type="button" className={`${buttonClass} ${current.display === "flex" && current.flexDirection === "column" ? activeButtonClass : ""}`} onClick={() => patch({ display: "flex", flexDirection: "column" })} title="Column layout">Column</button>
        {isSection && <SelectControl label="Direction" value={current.flexDirection} options={flexDirectionOptions} onChange={(value) => patch({ display: "flex", flexDirection: value })} />}
        <NumberStepper label="Gap" value={current.gap} fallback={12} min={0} max={120} onChange={(value) => patch({ gap: withPx(value) })} />
        {isSection && <>
          <SelectControl label="Justify" value={current.justifyContent} options={justifyContentOptions} onChange={(value) => patch({ display: "flex", justifyContent: value })} />
          <SelectControl label="Align items" value={current.alignItems} options={alignItemsOptions} onChange={(value) => patch({ display: "flex", alignItems: value })} />
          <SelectControl label="Align content" value={current.alignContent} options={alignContentOptions} onChange={(value) => patch({ display: "flex", alignContent: value })} />
          <DropdownPanel label="Margin">
            {spacingFields.map((field) => <NumberStepper key={field.key} label={`Margin ${field.label}`} value={current[`margin${field.key}`]} fallback={numberValue(current.margin, 0)} min={0} max={120} onChange={(value) => patch({ [`margin${field.key}`]: withPx(value) })} />)}
          </DropdownPanel>
          <DropdownPanel label="Padding">
            {spacingFields.map((field) => <NumberStepper key={field.key} label={`Padding ${field.label}`} value={current[`padding${field.key}`]} fallback={numberValue(current.padding, 0)} min={0} max={120} onChange={(value) => patch({ [`padding${field.key}`]: withPx(value) })} />)}
          </DropdownPanel>
          <DropdownPanel label="Border radius">
            {radiusFields.map((field) => <NumberStepper key={field.key || "all"} label={`${field.label} radius`} value={boxRadiusValue(field.key)} fallback={numberValue(current.borderRadius, 0)} min={0} max={120} onChange={(value) => updateBoxRadius(field.key, value)} />)}
          </DropdownPanel>
          <DropdownPanel label="Border">
            {borderSideFields.map((field) => <BorderSideControls key={field.borderKey} field={field} current={current} patch={patch} />)}
          </DropdownPanel>
        </>}
      </>}

      <ColorInput label="Bg" value={current.backgroundColor} onChange={(value) => patch({ backgroundColor: value })} />
      {!isImage && !isSection && <NumberStepper label="Radius" value={current.borderRadius} fallback={0} min={0} max={120} onChange={(value) => patch({ borderRadius: withPx(value) })} />}
    </div>
  </div>;

  return createPortal(bar, document.body);
}
