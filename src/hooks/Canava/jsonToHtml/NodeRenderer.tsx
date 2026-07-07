"use client";

import IconPreview from "@/hooks/PickIcons/icons/IconPreview";
import IconSelector from "@/hooks/PickIcons/icons/PickIcons";
import { getIconMetadata } from "@/hooks/PickIcons/icons";
import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import Image from "next/image";
import { CSSProperties, Dispatch, ElementType, SetStateAction, useEffect, useRef, useState } from "react";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { FiChevronDown, FiChevronUp, FiCopy, FiMoreVertical, FiPlus, FiTrash2 } from "react-icons/fi";

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
  onAddListItem?: (listNodeId: string) => void;
  onDeleteListItem?: (nodeId: string) => void;
  onDuplicateListItem?: (nodeId: string) => void;
  onMoveListItem?: (nodeId: string, direction: "up" | "down") => void;
  onSelectNode?: (nodeId: string) => void;
  style?: ResumeStyle;
  hoveredNodeId?: string | null;
  setHoveredNodeId?: Dispatch<SetStateAction<string | null>>;
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
type RepeatableItemActionsProps = {
  nodeId: string;
  parentId?: string;
  onAddListItem?: (listNodeId: string) => void;
  onDeleteListItem?: (nodeId: string) => void;
  onDuplicateListItem?: (nodeId: string) => void;
  onMoveListItem?: (nodeId: string, direction: "up" | "down") => void;
  onSelectNode?: (nodeId: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean | ((current: boolean) => boolean)) => void;
};

function RepeatableItemActions({ nodeId, parentId, onAddListItem, onDeleteListItem, onDuplicateListItem, onMoveListItem, onSelectNode, isMenuOpen, setIsMenuOpen }: RepeatableItemActionsProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [isMenuOpen, setIsMenuOpen]);

  const runAction = (action: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    action();
    setIsMenuOpen(false);
  };

  return (
    <div ref={menuRef} className="absolute end-0 top-0 z-20 print:hidden">
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); setIsMenuOpen(open => !open); onSelectNode?.(nodeId); }}
        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/95 text-slate-600 opacity-100 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:opacity-0 md:group-hover/repeatable:opacity-100 md:group-focus-within/repeatable:opacity-100"
        aria-label="Open item actions"
        aria-expanded={isMenuOpen}
        title="Item actions"
      >
        <FiMoreVertical size={16} aria-hidden />
      </button>
      {isMenuOpen && (
        <div className="absolute end-0 mt-1 min-w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm text-slate-700 shadow-xl">
          <button type="button" onClick={runAction(() => parentId && onAddListItem?.(parentId))} className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-slate-50"><FiPlus aria-hidden />Add Item</button>
          <button type="button" onClick={runAction(() => onDuplicateListItem?.(nodeId))} className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-slate-50"><FiCopy aria-hidden />Duplicate</button>
          <button type="button" onClick={runAction(() => onMoveListItem?.(nodeId, "up"))} className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-slate-50"><FiChevronUp aria-hidden />Move Up</button>
          <button type="button" onClick={runAction(() => onMoveListItem?.(nodeId, "down"))} className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-slate-50"><FiChevronDown aria-hidden />Move Down</button>
          <button type="button" onClick={runAction(() => onDeleteListItem?.(nodeId))} className="flex w-full items-center gap-2 px-3 py-2 text-start text-red-600 hover:bg-red-50"><FiTrash2 aria-hidden />Delete</button>
        </div>
      )}
    </div>
  );
}

const normalizeHref = (href: string) => {
  const trimmedHref = href.trim();
  if (!trimmedHref || trimmedHref === "#") return "#";
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmedHref)) return trimmedHref;
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedHref)) return `mailto:${trimmedHref}`;
  return `https://${trimmedHref}`;
};

export default function NodeRenderer({ node, sectionId, content = {}, isEditable = true, selectedNodeId, showIcons = true, showSectionIcons = true, direction = "LTR", onUpdate, onAddListItem, onDeleteListItem, onDuplicateListItem, onMoveListItem, onSelectNode, style, hoveredNodeId: controlledHoveredNodeId, setHoveredNodeId: controlledSetHoveredNodeId }: NodeRendererProps) {
  const [isRepeatableMenuOpen, setIsRepeatableMenuOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [internalHoveredNodeId, setInternalHoveredNodeId] = useState<string | null>(null);
  const hoveredNodeId = controlledHoveredNodeId ?? internalHoveredNodeId;
  const setHoveredNodeId = controlledSetHoveredNodeId ?? setInternalHoveredNodeId;

  if ((node.tag === "i" || node.tag === "svg") && !showIcons) return null;
  if ((node.tag === "i" || node.tag === "svg") && (node.role === "sectionIcon" || node.role === "sectionTitleIcon") && !showSectionIcons) return null;

  const key = contentKeyFor(node);
  const nodeContent = content[key];
  const hasText = !TEXTLESS_TAGS.has(node.tag);
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const Tag = node.tag as ElementType;
  const nodeStyle = getNodeStyle(node, style);

  const common = {
    dir: direction.toLowerCase(),
    "data-node-id": node.id,
    "data-section-id": sectionId,
    onClick: isEditable ? (event: React.MouseEvent<HTMLElement>) => { event.stopPropagation(); onSelectNode?.(node.id); } : undefined,
    onMouseOver: isEditable ? (event: React.MouseEvent<HTMLElement>) => { event.stopPropagation(); setHoveredNodeId(node.id); } : undefined,
    onMouseLeave: isEditable ? () => setHoveredNodeId((current) => current === node.id ? null : current) : undefined,
    className: `${isSelected ? "ring-2 ring-blue-500 ring-offset-1 rounded-sm bg-blue-50/20 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]" : ""} ${isHovered && !isSelected ? "ring-1 ring-blue-200 ring-offset-1 rounded-sm" : ""} ${isEditable ? "cursor-pointer transition-all duration-200 ease-out" : ""}`,
    style: nodeStyle,
  };

  const renderChild = (child: Schema) => (
    <NodeRenderer key={child.id} node={child} sectionId={sectionId} content={content} isEditable={isEditable} selectedNodeId={selectedNodeId} showIcons={showIcons} showSectionIcons={showSectionIcons} direction={direction} onUpdate={onUpdate} onAddListItem={onAddListItem} onDeleteListItem={onDeleteListItem} onDuplicateListItem={onDuplicateListItem} onMoveListItem={onMoveListItem} onSelectNode={onSelectNode} style={style} hoveredNodeId={hoveredNodeId} setHoveredNodeId={setHoveredNodeId} />
  );
  const children = node.children?.flatMap((child) => {
    if (node.tag === "section" && child.tag === "section") return child.children?.map(renderChild) ?? [];
    return [renderChild(child)];
  });

  if (node.tag === "i" || node.tag === "svg") {
    const iconName = nodeContent?.value || "FaUser";
    const selectedIcon = getIconMetadata(iconName.trim()) ?? null;

    return (
      <span
        {...common}
        onClick={isEditable ? (event: React.MouseEvent<HTMLElement>) => {
          event.stopPropagation();
          onSelectNode?.(node.id);
          setIsIconPickerOpen(true);
        } : undefined}
        className={`relative inline-flex align-middle ${common.className}`}
      >
        <IconPreview name={iconName} aria-hidden />
        {isEditable && isIconPickerOpen && (
          <span className="absolute start-0 top-full z-50 mt-2 block w-80" onClick={(event) => event.stopPropagation()}>
            <IconSelector
              selectedIcon={selectedIcon}
              initiallyOpen
              onSelect={(icon) => {
                onUpdate?.(key, icon.name, nodeContent?.prop);
                setIsIconPickerOpen(false);
              }}
            />
          </span>
        )}
      </span>
    );
  }

  if (node.tag === "img") {
    return <Image {...common} className={`inline-block ${common.className}`} src={nodeContent?.value || "/placeholder.png"} alt={nodeContent?.prop?.alt || "Image"} width={100} height={100} />
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
      <li
        {...common}
        onContextMenu={
          isEditable ? (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault(); event.stopPropagation();
            setIsRepeatableMenuOpen(true);
            onSelectNode?.(node.id);
          }
            : undefined}
        className={`group/repeatable relative pe-8 ${common.className}`}
      >
        {nodeContent?.value && <span contentEditable={isEditable} suppressContentEditableWarning onBlur={(e: React.FocusEvent<HTMLElement>) => onUpdate?.(key, e.currentTarget.textContent ?? "")} className="outline-none">{nodeContent.value}</span>}
        {children}
        {isEditable && <RepeatableItemActions nodeId={node.id} parentId={node.parentId} onAddListItem={onAddListItem} onDeleteListItem={onDeleteListItem} onDuplicateListItem={onDuplicateListItem} onMoveListItem={onMoveListItem} onSelectNode={onSelectNode} isMenuOpen={isRepeatableMenuOpen} setIsMenuOpen={setIsRepeatableMenuOpen} />}
      </li>
    );
  }

  if (hasText) {
    if (!nodeContent?.value) return null;

    return (
      <Tag {...common} contentEditable={isEditable} suppressContentEditableWarning onBlur={(e: React.FocusEvent<HTMLElement>) => onUpdate?.(key, e.currentTarget.textContent ?? "")} style={{ ...nodeStyle, outline: "none" }}>
        {nodeContent.value}
      </Tag>
    );
  }

  return <Tag {...common}>{children}</Tag>;
}
