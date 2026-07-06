"use client";

import { useEffect, useRef } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import BuildLayout from "./BuildLayout";

export default function Canava() {
  const { sections, settings, distribution, content, style, mode, selectedNodeId, setSelectedNodeId, updateContent, addListItem, deleteListItem, duplicateListItem, moveListItem, addChildNode, removeSectionFromDistribution, updateDistributionItem, duplicateSection, pageCount, setPageCount } = useResumeBuilder();
  const canvasRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={canvasRef}>
      {style.customCSS && <style>{style.customCSS}</style>}
      <BuildLayout sections={sections} settings={settings} distribution={distribution} content={content} mode={mode} selectedNodeId={selectedNodeId} onNodeSelect={setSelectedNodeId} onNodeUpdate={updateContent} onListItemAdd={addListItem} onListItemDelete={deleteListItem} onListItemDuplicate={duplicateListItem} onListItemMove={moveListItem} onAddChildNode={addChildNode} onSectionHide={removeSectionFromDistribution} onSectionDuplicate={duplicateSection} onSectionIconToggle={(sectionId) => updateDistributionItem(sectionId, { showIcon: !(distribution[sectionId]?.showIcon ?? true) })} style={style} pageCount={pageCount} />
    </div>
  );
}
