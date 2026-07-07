"use client";

import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiAlignCenter, FiAlignLeft, FiAlignRight, FiBold, FiItalic, FiMinus, FiPlus } from "react-icons/fi";
import { fonts, numberValue, useVisualStylesPanel, withPx } from "@/hooks/useVisualStylesPanel";
import { StyleObject } from "@/types/resume/ResumeStyle";

type FloatingElementStyleBarProps = { canvasRef: RefObject<HTMLDivElement | null> };
type BarPosition = { left: number; top: number };
type DragState = { pointerId: number; offsetX: number; offsetY: number };
type ManualBarPosition = BarPosition & { nodeId: string };

const buttonClass = "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700";
const activeButtonClass = "border-blue-500 bg-blue-50 text-blue-700";
const inputClass = "h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500";

function compactFontName(value?: string | number) {
  return fonts.find((font) => font.value === value)?.name ?? "Font";
}

function NumberStepper({ label, value, fallback, min, max, onChange }: { label: string; value?: string | number; fallback: number; min: number; max: number; onChange: (value: number) => void }) {
  const current = numberValue(value, fallback);
  const setNext = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1" aria-label={label}>
    <button type="button" className={buttonClass} onClick={() => setNext(current - 1)}><FiMinus /></button>
    <span className="min-w-12 text-center text-xs font-black text-slate-600">{current}px</span>
    <button type="button" className={buttonClass} onClick={() => setNext(current + 1)}><FiPlus /></button>
  </div>;
}

function ColorInput({ label, value, onChange }: { label: string; value?: string | number; onChange: (value: string) => void }) {
  const current = String(value ?? "#111827");
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(current) ? current : "#111827";

  return <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-500">
    {label}
    <input type="color" value={pickerValue} onChange={(event) => onChange(event.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white" />
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
  const isLayout = ["section", "container", "list", "listItem"].includes(selectedGroup);
  const patch = (next: StyleObject) => updateElement(next);

  const selectedManualPosition = manualPosition?.nodeId === selectedNode.id ? manualPosition : null;
  const displayedPosition = selectedManualPosition ?? position;
  const isManuallyPlaced = Boolean(selectedManualPosition);

  const bar = <div
    ref={barRef}
    data-floating-style-bar="true"
    className={`fixed z-[9999] max-w-[calc(100vw-1rem)] rounded-[1.35rem] border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-900/15 backdrop-blur ${isManuallyPlaced ? "" : "-translate-x-1/2"}`}
    style={{ left: displayedPosition.left, top: displayedPosition.top }}
    onPointerDown={(event) => event.stopPropagation()}
    onClick={(event) => event.stopPropagation()}
  >
    <div className="flex max-w-full flex-wrap items-center gap-2 overflow-x-hidden px-1">
      <button
        type="button"
        className="inline-flex h-9 cursor-grab touch-none items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-black text-slate-500 active:cursor-grabbing"
        aria-label="Move style bar"
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
        <select value={String(current.fontFamily ?? "")} onChange={(event) => patch({ fontFamily: event.target.value })} className={`${inputClass} w-32`} aria-label="Font family">
          <option value="">{compactFontName(current.fontFamily)}</option>
          {fonts.map((font) => <option key={font.id} value={font.value}>{font.name}</option>)}
        </select>
        <NumberStepper label="Font size" value={current.fontSize} fallback={selectedGroup === "heading" ? 22 : 14} min={8} max={96} onChange={(value) => patch({ fontSize: withPx(value) })} />
        <button type="button" className={`${buttonClass} ${current.fontWeight === 700 ? activeButtonClass : ""}`} onClick={() => patch({ fontWeight: current.fontWeight === 700 ? 400 : 700 })}><FiBold /></button>
        <button type="button" className={`${buttonClass} ${current.fontStyle === "italic" ? activeButtonClass : ""}`} onClick={() => patch({ fontStyle: current.fontStyle === "italic" ? "normal" : "italic" })}><FiItalic /></button>
        <button type="button" className={`${buttonClass} ${current.textAlign === "left" ? activeButtonClass : ""}`} onClick={() => patch({ textAlign: "left" })}><FiAlignLeft /></button>
        <button type="button" className={`${buttonClass} ${current.textAlign === "center" ? activeButtonClass : ""}`} onClick={() => patch({ textAlign: "center" })}><FiAlignCenter /></button>
        <button type="button" className={`${buttonClass} ${current.textAlign === "right" ? activeButtonClass : ""}`} onClick={() => patch({ textAlign: "right" })}><FiAlignRight /></button>
        <ColorInput label="Text" value={current.color} onChange={(value) => patch({ color: value })} />
      </>}

      {isImage && <>
        <NumberStepper label="Image width" value={current.width} fallback={96} min={24} max={360} onChange={(value) => patch({ width: withPx(value) })} />
        <NumberStepper label="Image height" value={current.height} fallback={96} min={24} max={360} onChange={(value) => patch({ height: withPx(value) })} />
        <select value={String(current.objectFit ?? "")} onChange={(event) => patch({ objectFit: event.target.value })} className={`${inputClass} w-28`} aria-label="Object fit">
          <option value="">Fit</option><option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option><option value="scale-down">Scale down</option>
        </select>
      </>}

      {isLayout && <>
        <button type="button" className={`${buttonClass} ${current.display === "flex" && current.flexDirection === "row" ? activeButtonClass : ""}`} onClick={() => patch({ display: "flex", flexDirection: "row" })}>Row</button>
        <button type="button" className={`${buttonClass} ${current.display === "flex" && current.flexDirection === "column" ? activeButtonClass : ""}`} onClick={() => patch({ display: "flex", flexDirection: "column" })}>Column</button>
        <NumberStepper label="Gap" value={current.gap} fallback={12} min={0} max={48} onChange={(value) => patch({ gap: withPx(value) })} />
      </>}

      <ColorInput label="Bg" value={current.backgroundColor} onChange={(value) => patch({ backgroundColor: value })} />
      <NumberStepper label="Radius" value={current.borderRadius} fallback={0} min={0} max={120} onChange={(value) => patch({ borderRadius: withPx(value) })} />
    </div>
  </div>;

  return createPortal(bar, document.body);
}
