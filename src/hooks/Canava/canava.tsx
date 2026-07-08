"use client";

import { MouseEvent, useCallback, useEffect, useRef } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import BuildLayout from "./BuildLayout";
import FloatingElementStyleBar from "./FloatingElementStyleBar";

export default function Canava() {
  const { sections, settings, distribution, content, style, mode, selectedNodeId, selectedNodeIds, setSelectedNodeId, setSelectedNodeIds, updateContent, addListItem, deleteListItem, duplicateListItem, moveListItem, pageCount, setPageCount } = useResumeBuilder();
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectNode = useCallback((nodeId: string, event?: MouseEvent<HTMLElement>) => {
    if (event?.ctrlKey || event?.metaKey) {
      setSelectedNodeIds((current) => current.includes(nodeId) ? current.filter((id) => id !== nodeId) : [...current, nodeId]);
      return;
    }

    setSelectedNodeId(nodeId);
  }, [setSelectedNodeId, setSelectedNodeIds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updatePageCount = () => {
      const resume = canvas.querySelector<HTMLElement>("#resume");
      if (!resume) return;

      const singlePageHeight = settings.pageSize === "A4" ? 297 : 279.4;
      const singlePageHeightPx = singlePageHeight * (96 / 25.4);
      const flow = resume.querySelector<HTMLElement>("[data-resume-flow=\"true\"]");
      const measuredHeight = flow ? flow.scrollHeight : resume.scrollHeight;
      const nextPageCount = Math.max(1, Math.ceil(measuredHeight / singlePageHeightPx));
      setPageCount((current) => current === nextPageCount ? current : nextPageCount);
    };

    updatePageCount();
    const resizeObserver = new ResizeObserver(updatePageCount);
    resizeObserver.observe(canvas);
    const resume = canvas.querySelector<HTMLElement>("#resume");
    if (resume) resizeObserver.observe(resume);

    return () => resizeObserver.disconnect();
  }, [content, distribution, sections, setPageCount, settings.pageSize, style]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedNodeId) return;

    const clearSelectionOnCanvasBlankClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!canvas.contains(target)) return;
      if (target.closest("[data-node-id], [data-floating-style-bar]")) return;

      setSelectedNodeIds([]);
    };

    canvas.addEventListener("pointerdown", clearSelectionOnCanvasBlankClick);
    return () => canvas.removeEventListener("pointerdown", clearSelectionOnCanvasBlankClick);
  }, [selectedNodeId, setSelectedNodeIds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedNodeId) return;

    const structureSignature = (element: Element) => [
      element.tagName.toLowerCase(),
      ...Array.from(element.children).map((child) => child.tagName.toLowerCase()),
    ].join(">");

    const selectMatchingStructure = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "a") return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;

      const selectedElement = canvas.querySelector(`[data-node-id="${CSS.escape(selectedNodeId)}"]`);
      if (!selectedElement) return;

      event.preventDefault();
      const signature = structureSignature(selectedElement);
      const matchingIds = Array.from(canvas.querySelectorAll<HTMLElement>("[data-node-id]"))
        .filter((element) => structureSignature(element) === signature)
        .map((element) => element.dataset.nodeId)
        .filter((id): id is string => Boolean(id));

      setSelectedNodeIds([...new Set(matchingIds)]);
    };

    document.addEventListener("keydown", selectMatchingStructure);
    return () => document.removeEventListener("keydown", selectMatchingStructure);
  }, [selectedNodeId, setSelectedNodeIds]);

  return (
    <div ref={canvasRef} className="resume-canvas-shell relative origin-top">
      {style.customCSS && <style>{style.customCSS}</style>}
      <FloatingElementStyleBar canvasRef={canvasRef} />
      <BuildLayout sections={sections} settings={settings} distribution={distribution} content={content} mode={mode} selectedNodeId={selectedNodeId} selectedNodeIds={selectedNodeIds} onNodeSelect={selectNode} onNodeUpdate={updateContent} onListItemAdd={addListItem} onListItemDelete={deleteListItem} onListItemDuplicate={duplicateListItem} onListItemMove={moveListItem} style={style} pageCount={pageCount} />
    </div>
  );
}
