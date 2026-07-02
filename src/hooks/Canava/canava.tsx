"use client";

import { useResumeBuilder } from "@/context/resume/ResumeContext";
import BuildLayout from "./BuildLayout";

export default function Canava() {
  const { sections, settings, distribution, content, style, mode, selectedNodeId, setSelectedNodeId, updateContent } = useResumeBuilder();

  return (
    <div className="canava-container overflow-auto rounded-lg bg-white p-4 shadow-lg" style={style.global}>
      {style.customCSS && <style>{style.customCSS}</style>}
      <BuildLayout sections={sections} settings={settings} distribution={distribution} content={content} mode={mode} selectedNodeId={selectedNodeId} onNodeSelect={setSelectedNodeId} onNodeUpdate={updateContent} />
    </div>
  );
}
