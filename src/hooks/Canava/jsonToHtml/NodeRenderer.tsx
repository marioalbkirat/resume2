"use client";

import { ICON_MAP } from "@/hooks/PickIcons/icons";
import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import Image from "next/image";
import { CSSProperties, ElementType } from "react";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { FiTrash2 } from "react-icons/fi";

type NodeRendererProps = {
  node: Schema;
  sectionId: string;
  content?: Record<string, Content>;
  isEditable?: boolean;
  selectedNodeId?: string | null;
  showIcons?: boolean;
  showSectionIcons?: boolean;
  direction?: "LTR" | "RTL";
  onUpdate?: (nodeId: string, value: string, props?: Record<string, string>) => void;
  onDeleteListItem?: (nodeId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  style?: ResumeStyle;
};

const TEXTLESS_TAGS = new Set(["section", "div", "ul", "ol"]);
const contentKeyFor = (node: Schema) => node.id;
const asCssProperties = (style?: StyleObject) => (style ?? {}) as CSSProperties;
const borderLonghandPattern = /^border(Top|Right|Bottom|Left)(Width|Style|Color)?$/;
const borderAxisPattern = /^border(Width|Style|Color)$/;
const normalizeBorderStyle = (style: CSSProperties) => {
  const next = { ...style } as CSSProperties & Record<string, unknown>;
  const hasSideBorder = Object.keys(next).some((key) => borderLonghandPattern.test(key));
  if (hasSideBorder) {
    delete next.border;
    Object.keys(next).forEach((key) => {
      if (borderAxisPattern.test(key)) delete next[key];
    });
  }
  return next as CSSProperties;
};
const selectorKeysFor = (node: Schema) => {
  const keys = [node.tag];
  if (node.tag === "section") keys.push("section");
  if (node.tag === "i" || node.tag === "svg") keys.push("icon");
  if (node.tag === "img") keys.push("image");
  if (node.tag === "li") keys.push("listItem");
  if (node.tag === "ul" || node.tag === "ol") keys.push("list");
  if (node.tag === "a") keys.push("link");
  if (node.tag === "p") keys.push("paragraph");
  if (node.tag === "span") keys.push("text");
  if (/^h[1-6]$/.test(node.tag)) keys.push("heading");
  if (node.tag === "div") keys.push("container");
  return [...new Set(keys.filter(Boolean))];
};
const getNodeStyle = (node: Schema, style?: ResumeStyle) => normalizeBorderStyle({
  ...selectorKeysFor(node).reduce((acc, key) => ({ ...acc, ...asCssProperties(style?.selectors?.[key]) }), {} as CSSProperties),
  ...asCssProperties(style?.elements?.[node.id]),
});
const normalizeHref = (href: string) => {
  const trimmedHref = href.trim();
  if (!trimmedHref || trimmedHref === "#") return "#";
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmedHref)) return trimmedHref;
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedHref)) return `mailto:${trimmedHref}`;
  return `https://${trimmedHref}`;
};

export default function NodeRenderer({ node, sectionId, content = {}, isEditable = true, selectedNodeId, showIcons = true, showSectionIcons = true, direction = "LTR", onUpdate, onDeleteListItem, onSelectNode, style }: NodeRendererProps) {
  if ((node.tag === "i" || node.tag === "svg") && !showIcons) return null;
  if ((node.tag === "i" || node.tag === "svg") && (node.role === "sectionIcon" || node.role === "sectionTitleIcon") && !showSectionIcons) return null;

  const key = contentKeyFor(node);
  const nodeContent = content[key];
  const hasText = !TEXTLESS_TAGS.has(node.tag);
  const isSelected = selectedNodeId === node.id;
  const Tag = node.tag as ElementType;
  const nodeStyle = getNodeStyle(node, style);

  const common = {
    dir: direction.toLowerCase(),
    "data-node-id": node.id,
    "data-section-id": sectionId,
    onClick: isEditable ? (event: React.MouseEvent<HTMLElement>) => { event.stopPropagation(); onSelectNode?.(node.id); } : undefined,
    className: `${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""} ${isEditable ? "cursor-pointer" : ""}`,
    style: nodeStyle,
  };

  const children = node.children?.map((child) => (
    <NodeRenderer key={child.id} node={child} sectionId={sectionId} content={content} isEditable={isEditable} selectedNodeId={selectedNodeId} showIcons={showIcons} showSectionIcons={showSectionIcons} direction={direction} onUpdate={onUpdate} onDeleteListItem={onDeleteListItem} onSelectNode={onSelectNode} style={style} />
  ));

  if (node.tag === "i") {
    const iconName = nodeContent?.value || "FaUser";
    const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP];
    return <span {...common} className={`inline-flex align-middle ${common.className}`}>{Icon ? <Icon aria-hidden /> : null}</span>;
  }

  if (node.tag === "img") {
    return <span {...common} className={`inline-block ${common.className}`}><Image src={nodeContent?.value || "/placeholder.png"} alt={nodeContent?.prop?.alt || "Image"} width={100} height={100} /></span>;
  }

  if (node.tag === "a") {
    const href = normalizeHref(nodeContent?.prop?.href || "#");
    const isExternalLink = /^https?:\/\//i.test(href);

    return (
      <a
        {...common}
        href={isEditable ? undefined : href}
        data-pdf-link={!isEditable && href !== "#" ? href : undefined}
        target={!isEditable && isExternalLink ? "_blank" : undefined}
        rel={!isEditable && isExternalLink ? "noopener noreferrer" : undefined}
        contentEditable={isEditable ? true : undefined}
        suppressContentEditableWarning
        onBlur={(e: React.FocusEvent<HTMLAnchorElement>) => onUpdate?.(key, e.currentTarget.textContent ?? "")}
        style={{ ...nodeStyle, outline: "none" }}
      >
        {nodeContent?.value ?? ""}
      </a>
    );
  }

  if (node.tag === "li") {
    return (
      <li {...common} className={`relative pe-7 ${common.className}`}>
        <span contentEditable={isEditable} suppressContentEditableWarning onBlur={(e: React.FocusEvent<HTMLElement>) => onUpdate?.(key, e.currentTarget.textContent ?? "")} className="outline-none">{nodeContent?.value ?? ""}</span>
        {children}
        {isEditable && <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteListItem?.(node.id); }} className="absolute end-0 top-0 cursor-pointer rounded p-1 text-red-500 hover:bg-red-50" title="Delete item"><FiTrash2 size={14} /></button>}
      </li>
    );
  }

  if (hasText) {
    return (
      <Tag {...common} contentEditable={isEditable} suppressContentEditableWarning onBlur={(e: React.FocusEvent<HTMLElement>) => onUpdate?.(key, e.currentTarget.textContent ?? "")} style={{ ...nodeStyle, outline: "none" }}>
        {nodeContent?.value ?? ""}
      </Tag>
    );
  }

  return <Tag {...common}>{children}</Tag>;
}
