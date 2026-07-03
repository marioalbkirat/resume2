"use client";

import { useResumeBuilder } from "@/context/resume/ResumeContext";
import BuildLayout from "./BuildLayout";

export default function Canava() {
  const { sections, settings, distribution, content, style, mode, selectedNodeId, setSelectedNodeId, updateContent } = useResumeBuilder();

  return (
    <>
      {style.customCSS && <style>{style.customCSS}</style>}
      <BuildLayout sections={sections} settings={settings} distribution={distribution} content={content} mode={mode} selectedNodeId={selectedNodeId} onNodeSelect={setSelectedNodeId} onNodeUpdate={updateContent} style={style.global} />
    </>
  );
}
