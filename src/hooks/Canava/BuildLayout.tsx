"use client";

import { Content } from "@/types/resume/Content";
import { Distribution } from "@/types/resume/Distribution";
import { Section } from "@/types/resume/Section";
import { Settings } from "@/types/resume/Settings";
import { CSSProperties, useMemo } from "react";
import { FiPlus } from "react-icons/fi";
import NodeRenderer from "./jsonToHtml/NodeRenderer";

interface BuildLayoutProps {
  sections: Section[];
  settings: Settings;
  distribution: Distribution;
  content?: Record<string, Content>;
  mode: "preview" | "edit";
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string) => void;
  onNodeUpdate?: (sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => void;
  onListItemAdd?: (sectionId: string, listNodeId: string) => void;
  onListItemDelete?: (sectionId: string, listItemId: string) => void;
  style?: CSSProperties;
}

const findFirstListId = (section: Section): string | null => {
  const stack = [section.schema];
  while (stack.length) {
    const node = stack.shift();
    if (!node) continue;
    if (node.tag === "ul" || node.tag === "ol") return node.id;
    stack.push(...(node.children ?? []));
  }
  return null;
};

export default function BuildLayout({ sections, settings, distribution, content = {}, mode, selectedNodeId, onNodeSelect, onNodeUpdate, onListItemAdd, onListItemDelete, style }: BuildLayoutProps) {
  const isEditable = mode === "edit";
  const pageSizeStyle = useMemo<CSSProperties>(() => {
    const { background, ...safeStyle } = style ?? {};
    const fallbackBackgroundColor = typeof background === "number" ? `${background}` : background;

    return {
      ...safeStyle,
      boxSizing: "border-box",
      width: settings.pageSize === "A4" ? "210mm" : "215.9mm",
      minHeight: settings.pageSize === "A4" ? "297mm" : "279.4mm",
      padding: "10mm",
      boxShadow: "0 0 3px rgba(0,0,0,0.2)",
      backgroundColor: safeStyle.backgroundColor ?? fallbackBackgroundColor ?? "white",
      overflow: "visible",
    };
  }, [settings.pageSize, style]);

  const sortedSections = useMemo(() => [...sections]
    .filter((section) => Boolean(distribution[section.id]) && (distribution[section.id]?.visible ?? true))
    .sort((a, b) => (distribution[a.id]?.order ?? 9999) - (distribution[b.id]?.order ?? 9999)), [sections, distribution]);

  const renderSection = (section: Section) => {
    const listId = findFirstListId(section);
    const config = distribution[section.id];
    return (
      <section key={section.id} className="resume-section group mb-5 break-inside-avoid" data-section-id={section.id}>
        {isEditable && (
          <div className="mb-2 flex items-center justify-between bg-transparent px-0 py-1 text-xs text-gray-600 print:hidden">
            <span>{section.name}</span>
            {listId && (
              <button type="button" onClick={() => onListItemAdd?.(section.id, listId)} className="inline-flex cursor-pointer items-center justify-center rounded bg-green-600 p-1.5 text-white hover:bg-green-700" title={`Add ${section.name} item`} aria-label={`Add ${section.name} item`}>
                <FiPlus />
              </button>
            )}
          </div>
        )}
        <NodeRenderer
          node={section.schema}
          sectionId={section.id}
          content={content}
          isEditable={isEditable}
          selectedNodeId={selectedNodeId}
          showIcons={settings.showIcons}
          showSectionIcons={config?.showIcon ?? true}
          direction={settings.direction}
          onUpdate={(nodeId, value, props) => onNodeUpdate?.(section.id, nodeId, value, props)}
          onDeleteListItem={(nodeId) => onListItemDelete?.(section.id, nodeId)}
          onSelectNode={onNodeSelect}
        />
      </section>
    );
  };

  if (settings.columns === "ONE") {
    return <div id="resume" dir={settings.direction.toLowerCase()} style={pageSizeStyle}>{sortedSections.map(renderSection)}</div>;
  }

  const left = sortedSections.filter((section) => distribution[section.id]?.position !== "right");
  const right = sortedSections.filter((section) => distribution[section.id]?.position === "right");
  const sidebarLeft = settings.sidebar?.position !== "RIGHT";
  const sidebar = <aside>{left.map(renderSection)}</aside>;
  const main = <main>{right.map(renderSection)}</main>;

  return (
    <div id="resume" dir={settings.direction.toLowerCase()} style={pageSizeStyle}>
      <div style={{ display: "grid", gridTemplateColumns: sidebarLeft ? "1fr 2fr" : "2fr 1fr", gap: "24px" }}>
        {sidebarLeft ? <>{sidebar}{main}</> : <>{main}{sidebar}</>}
      </div>
    </div>
  );
}
