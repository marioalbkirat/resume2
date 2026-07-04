"use client";

import { Content } from "@/types/resume/Content";
import { Distribution } from "@/types/resume/Distribution";
import { Section } from "@/types/resume/Section";
import { Settings } from "@/types/resume/Settings";
import { CSSProperties, useMemo } from "react";
import { ResumeStyle } from "@/types/resume/ResumeStyle";
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
  style?: ResumeStyle;
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

const getPageGlobalStyle = (globalStyle: ResumeStyle["global"] = {}) => {
  const safeStyle = { ...globalStyle };
  const background = safeStyle.background;
  const padding = safeStyle.padding;
  delete safeStyle.background;
  delete safeStyle.padding;
  delete safeStyle.margin;
  delete safeStyle.sidebarBackgroundColor;
  delete safeStyle.mainBackgroundColor;
  delete safeStyle.columnBorder;
  delete safeStyle.leftColumnWidth;
  delete safeStyle.rightColumnWidth;
  return { safeStyle, background, padding };
};

const parseMillimeterValue = (value: unknown) => {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const getColumnWidths = (globalStyle: ResumeStyle["global"] | undefined, pageSize: Settings["pageSize"]) => {
  const pageWidth = pageSize === "A4" ? 210 : 215.9;
  const minimumColumnWidth = 40;
  const fallbackLeftWidth = pageSize === "A4" ? 70 : 72;
  const rawLeftWidth = parseMillimeterValue(globalStyle?.leftColumnWidth);
  const rawRightWidth = parseMillimeterValue(globalStyle?.rightColumnWidth);

  let leftWidth = rawLeftWidth && rawLeftWidth >= minimumColumnWidth ? rawLeftWidth : fallbackLeftWidth;
  let rightWidth = rawRightWidth && rawRightWidth >= minimumColumnWidth ? rawRightWidth : pageWidth - leftWidth;

  if (leftWidth + rightWidth > pageWidth) {
    const availableRightWidth = pageWidth - leftWidth;
    if (availableRightWidth >= minimumColumnWidth) {
      rightWidth = availableRightWidth;
    } else {
      leftWidth = fallbackLeftWidth;
      rightWidth = pageWidth - fallbackLeftWidth;
    }
  }

  return {
    leftWidth: `${Number(leftWidth.toFixed(1))}mm`,
    rightWidth: `${Number(rightWidth.toFixed(1))}mm`,
  };
};

export default function BuildLayout({ sections, settings, distribution, content = {}, mode, selectedNodeId, onNodeSelect, onNodeUpdate, onListItemAdd, onListItemDelete, style }: BuildLayoutProps) {
  const isEditable = mode === "edit";
  const pageSizeStyle = useMemo<CSSProperties>(() => {
    const { safeStyle, background, padding } = getPageGlobalStyle(style?.global);
    const fallbackBackgroundColor = background === undefined ? undefined : String(background);

    return {
      ...safeStyle,
      boxSizing: "border-box",
      width: settings.pageSize === "A4" ? "210mm" : "215.9mm",
      height: settings.pageSize === "A4" ? "297mm" : "279.4mm",
      minHeight: settings.pageSize === "A4" ? "297mm" : "279.4mm",
      padding: settings.columns === "ONE" ? padding : undefined,
      margin: 0,
      boxShadow: "0 0 3px rgba(0,0,0,0.2)",
      backgroundColor: settings.columns === "ONE" ? String(safeStyle.backgroundColor ?? fallbackBackgroundColor ?? "white") : "white",
      overflow: "visible",
    };
  }, [settings.columns, settings.pageSize, style?.global]);

  const columnStyle = useMemo(() => {
    const { leftWidth, rightWidth } = getColumnWidths(style?.global, settings.pageSize);

    return {
      sidebar: { backgroundColor: style?.global?.sidebarBackgroundColor } as CSSProperties,
      main: { backgroundColor: style?.global?.mainBackgroundColor } as CSSProperties,
      divider: String(style?.global?.columnBorder ?? ""),
      leftWidth,
      rightWidth,
      padding: style?.global?.padding,
    };
  }, [settings.pageSize, style?.global]);

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
          style={style}
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
  const columnPaddingStyle = columnStyle.padding ? { padding: columnStyle.padding } : {};
  const divider = columnStyle.divider ? <div aria-hidden="true" style={{ alignSelf: "stretch", borderLeft: columnStyle.divider, justifySelf: "center" }} /> : null;
  const dividerColumn = "0";
  const columnBaseStyle: CSSProperties = { boxSizing: "border-box", minWidth: 0, width: "100%" };
  const sidebar = <aside style={{ ...columnBaseStyle, ...columnStyle.sidebar, ...columnPaddingStyle }}>{left.map(renderSection)}</aside>;
  const main = <main style={{ ...columnBaseStyle, ...columnStyle.main, ...columnPaddingStyle }}>{right.map(renderSection)}</main>;
  const gridTemplateColumns = sidebarLeft
    ? `${columnStyle.leftWidth} ${dividerColumn} ${columnStyle.rightWidth}`
    : `${columnStyle.rightWidth} ${dividerColumn} ${columnStyle.leftWidth}`;

  return (
    <div id="resume" dir={settings.direction.toLowerCase()} style={pageSizeStyle}>
      <div style={{ display: "grid", gridTemplateColumns, columnGap: "12px" }}>
        {sidebarLeft ? <>{sidebar}{divider}{main}</> : <>{main}{divider}{sidebar}</>}
      </div>
    </div>
  );
}
