"use client";

import { useSampleResume } from "@/context/resume/sampleResumeContext";
import BuildLayout from "./BuildLayout";

export default function Canava() {
  const { sections, settings, distribution, content, mode, selectedNodeId, setSelectedNodeId, updateContent, addListItem, deleteListItem } = useSampleResume();
  return (
    <div className="canava-container overflow-auto rounded-lg bg-white p-4 shadow-lg">
      <BuildLayout sections={sections} settings={settings} distribution={distribution} content={content} mode={mode} selectedNodeId={selectedNodeId} onNodeSelect={setSelectedNodeId} onNodeUpdate={updateContent} onListItemAdd={addListItem} onListItemDelete={deleteListItem} />
    </div>
  );
}
