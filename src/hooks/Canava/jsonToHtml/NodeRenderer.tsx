"use client";

import IconPreview from "@/hooks/PickIcons/icons/IconPreview";
import IconSelector from "@/hooks/PickIcons/icons/PickIcons";
import { getIconMetadata } from "@/hooks/PickIcons/icons";
import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import Image from "next/image";
import { CSSProperties, Dispatch, ElementType, SetStateAction, useEffect, useRef, useState } from "react";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { FiChevronDown, FiChevronUp, FiCopy, FiMoreVertical, FiTrash2 } from "react-icons/fi";

type NodeRendererProps = {
  node: Schema;
  sectionId: string;
  content?: Record<string, Content>;
  isEditable?: boolean;
  selectedNodeId?: string | null;
  selectedNodeIds?: string[];
  showIcons?: boolean;
  showSectionIcons?: boolean;
  direction?: "LTR" | "RTL";
  onUpdate?: (nodeId: string, value: string, props?: Record<string, string>) => void;
  onAddListItem?: (listNodeId: string) => void;
  onDeleteListItem?: (nodeId: string) => void;
  onDuplicateListItem?: (nodeId: string) => void;
  onMoveListItem?: (nodeId: string, direction: "up" | "down") => void;
  onSelectNode?: (nodeId: string, event?: React.MouseEvent<HTMLElement>) => void;
  style?: ResumeStyle;
  hoveredNodeId?: string | null;
  setHoveredNodeId?: Dispatch<SetStateAction<string | null>>;
};

const TEXTLESS_TAGS = new Set(["section", "div", "ul", "ol"]);
const contentKeyFor = (node: Schema) => node.id;
const asCssProperties = (style?: StyleObject) => (style ?? {}) as CSSProperties;
const borderSideProperties = ["Top", "Right", "Bottom", "Left"] as const;
const borderAxisPattern = /^border(Width|Style|Color)$/;
const borderRadiusLonghandPattern = /^border(TopLeft|TopRight|BottomRight|BottomLeft)Radius$/;
const normalizeStyleShorthands = (style: CSSProperties) => {
  const next = { ...style } as CSSProperties & Record<string, unknown>;
  const styleKeys = Object.keys(next);
  const hasBorderLonghand = styleKeys.some((key) => borderAxisPattern.test(key) || borderSideProperties.some((side) => key.startsWith(`border${side}`)));

  if (hasBorderLonghand) {
    delete next.border;
    styleKeys.forEach((key) => {
      if (borderAxisPattern.test(key)) delete next[key];
    });
  }

  borderSideProperties.forEach((side) => {
    const sideKey = `border${side}`;
    const hasSideLonghand = [`${sideKey}Width`, `${sideKey}Style`, `${sideKey}Color`].some((key) => key in next);
    if (hasSideLonghand) delete next[sideKey];
  });

  if (styleKeys.some((key) => borderRadiusLonghandPattern.test(key))) {
    delete next.borderRadius;
  }

  delete next[["place", "Content"].join("")];

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
const getNodeStyle = (node: Schema, style?: ResumeStyle) => normalizeStyleShorthands({
  ...selectorKeysFor(node).reduce((acc, key) => ({ ...acc, ...asCssProperties(style?.selectors?.[key]) }), {} as CSSProperties),
  ...asCssProperties(style?.elements?.[node.id]),
});
type RepeatableItemActionsProps = {
  nodeId: string;
  onDeleteListItem?: (nodeId: string) => void;
  onDuplicateListItem?: (nodeId: string) => void;
  onMoveListItem?: (nodeId: string, direction: "up" | "down") => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean | ((current: boolean) => boolean)) => void;
};

function RepeatableItemActions({ nodeId, onDeleteListItem, onDuplicateListItem, onMoveListItem, isMenuOpen, setIsMenuOpen }: RepeatableItemActionsProps) {
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
    <div ref={menuRef} className="absolute top-0 z-20 print:hidden" style={{ right: "-20px" }}>
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); setIsMenuOpen(open => !open); }}
        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/95 text-slate-600 opacity-100 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:opacity-0 md:group-hover/repeatable:opacity-100 md:group-focus-within/repeatable:opacity-100"
        aria-label="Open item actions"
        aria-expanded={isMenuOpen}
        title="Item actions"
      >
        <FiMoreVertical size={16} aria-hidden />
      </button>
      {isMenuOpen && (
        <div className="absolute end-0 mt-1 min-w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm text-slate-700 shadow-xl">
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

export default function NodeRenderer({ node, sectionId, content = {}, isEditable = true, selectedNodeId, selectedNodeIds = [], showIcons = true, showSectionIcons = true, direction = "LTR", onUpdate, onAddListItem, onDeleteListItem, onDuplicateListItem, onMoveListItem, onSelectNode, style, hoveredNodeId: controlledHoveredNodeId, setHoveredNodeId: controlledSetHoveredNodeId }: NodeRendererProps) {
  const [isRepeatableMenuOpen, setIsRepeatableMenuOpen] = useState(false);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
  const imageMenuRef = useRef<HTMLSpanElement>(null);
  const linkMenuRef = useRef<HTMLSpanElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const iconRootRef = useRef<HTMLSpanElement>(null);
  const iconPickerRef = useRef<HTMLSpanElement>(null);
  const [internalHoveredNodeId, setInternalHoveredNodeId] = useState<string | null>(null);
  const hoveredNodeId = controlledHoveredNodeId ?? internalHoveredNodeId;
  const setHoveredNodeId = controlledSetHoveredNodeId ?? setInternalHoveredNodeId;

  useEffect(() => {
    if (!isIconPickerOpen) return;

    const closeIconPickerOnOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (iconPickerRef.current?.contains(target) || iconRootRef.current?.contains(target)) return;

      setIsIconPickerOpen(false);
    };

    document.addEventListener("pointerdown", closeIconPickerOnOutsidePointerDown, true);
    return () => document.removeEventListener("pointerdown", closeIconPickerOnOutsidePointerDown, true);
  }, [isIconPickerOpen]);


  useEffect(() => {
    if (!isImageMenuOpen && !isLinkMenuOpen) return;

    const closeNodeMenus = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (imageMenuRef.current?.contains(target) || linkMenuRef.current?.contains(target)) return;
      setIsImageMenuOpen(false);
      setIsLinkMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeNodeMenus);
    return () => document.removeEventListener("pointerdown", closeNodeMenus);
  }, [isImageMenuOpen, isLinkMenuOpen]);

  if ((node.tag === "i" || node.tag === "svg") && !showIcons) return null;
  if ((node.tag === "i" || node.tag === "svg") && (node.role === "sectionIcon" || node.role === "sectionTitleIcon") && !showSectionIcons) return null;

  const key = contentKeyFor(node);
  const nodeContent = content[key];
  const hasText = !TEXTLESS_TAGS.has(node.tag);
  const isSelected = selectedNodeId === node.id || selectedNodeIds.includes(node.id);
  const isHovered = hoveredNodeId === node.id;
  const Tag = node.tag as ElementType;
  const nodeStyle = getNodeStyle(node, style);

  const common = {
    dir: direction.toLowerCase(),
    "data-node-id": node.id,
    "data-section-id": sectionId,
    onClick: isEditable ? (event: React.MouseEvent<HTMLElement>) => { event.stopPropagation(); onSelectNode?.(node.id, event); } : undefined,
    onMouseOver: isEditable ? (event: React.MouseEvent<HTMLElement>) => { event.stopPropagation(); setHoveredNodeId(node.id); } : undefined,
    onMouseLeave: isEditable ? () => setHoveredNodeId((current) => current === node.id ? null : current) : undefined,
    className: `${isSelected ? "ring-2 ring-blue-500 ring-offset-1 rounded-sm bg-blue-50/20 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]" : ""} ${isHovered && !isSelected ? "ring-1 ring-blue-200 ring-offset-1 rounded-sm" : ""} ${isEditable ? "cursor-pointer transition-all duration-200 ease-out" : ""}`,
    style: nodeStyle,
  };


  const uploadReplacementImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/resume/upload-image", { method: "POST", body: formData });
    const result = await response.json() as { path?: string; error?: string };

    if (!response.ok || !result.path) throw new Error(result.error || "Failed to upload image");
    onUpdate?.(key, result.path, { ...nodeContent?.prop, src: result.path });
  };

  const editLinkHref = () => {
    const currentHref = nodeContent?.prop?.href || "";
    const nextHref = window.prompt("Edit link href", currentHref);
    if (nextHref === null) return;
    onUpdate?.(key, nodeContent?.value || "", { ...nodeContent?.prop, href: normalizeHref(nextHref) });
  };

  const renderChild = (child: Schema) => (
    <NodeRenderer key={child.id} node={child} sectionId={sectionId} content={content} isEditable={isEditable} selectedNodeId={selectedNodeId} selectedNodeIds={selectedNodeIds} showIcons={showIcons} showSectionIcons={showSectionIcons} direction={direction} onUpdate={onUpdate} onAddListItem={onAddListItem} onDeleteListItem={onDeleteListItem} onDuplicateListItem={onDuplicateListItem} onMoveListItem={onMoveListItem} onSelectNode={onSelectNode} style={style} hoveredNodeId={hoveredNodeId} setHoveredNodeId={setHoveredNodeId} />
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
        ref={iconRootRef}
        onClick={isEditable ? (event: React.MouseEvent<HTMLElement>) => {
          event.stopPropagation();
          onSelectNode?.(node.id, event);
          setIsIconPickerOpen(true);
        } : undefined}
        className={`relative inline-flex align-middle ${common.className}`}
      >
        <IconPreview name={iconName} aria-hidden />
        {isEditable && isIconPickerOpen && (
          <span ref={iconPickerRef} className="absolute start-0 top-full z-50 mt-2 block w-80" onClick={(event) => event.stopPropagation()}>
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
    const imageSrc = nodeContent?.prop?.src || nodeContent?.value || "/placeholder.png";

    return (
      <span ref={imageMenuRef} className="group/image relative inline-block align-middle">
        <Image {...common} className={`inline-block ${common.className}`} src={imageSrc} alt={nodeContent?.prop?.alt || "Image"} width={100} height={100} />
        {isEditable && (
          <>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setIsImageMenuOpen(open => !open); }}
              className="absolute top-0 z-20 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/95 text-slate-600 opacity-100 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:opacity-0 md:group-hover/image:opacity-100 md:group-focus-within/image:opacity-100 print:hidden"
              style={{ right: "-20px" }}
              aria-label="Open image actions"
              aria-expanded={isImageMenuOpen}
              title="Image actions"
            >
              <FiMoreVertical size={16} aria-hidden />
            </button>
            {isImageMenuOpen && (
              <div className="absolute z-30 mt-1 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm text-slate-700 shadow-xl print:hidden" style={{ right: "-20px", top: "28px" }}>
                <button type="button" onClick={(event) => { event.stopPropagation(); imageInputRef.current?.click(); }} className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-slate-50">Replace image</button>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                void uploadReplacementImage(file).finally(() => setIsImageMenuOpen(false));
              }}
            />
          </>
        )}
      </span>
    );
  }

  if (node.tag === "a") {
    const href = normalizeHref(nodeContent?.prop?.href || "#");
    const isExternalLink = /^https?:\/\//i.test(href);

    return (
      <span ref={linkMenuRef} className="group/link relative inline-block align-baseline">
        <a
          {...common}
          href={isEditable ? undefined : href}
          data-pdf-link={!isEditable && href !== "#" ? href : undefined}
          target={!isEditable && isExternalLink ? "_blank" : undefined}
          rel={!isEditable && isExternalLink ? "noopener noreferrer" : undefined}
          contentEditable={isEditable ? true : undefined}
          suppressContentEditableWarning
          onBlur={(e: React.FocusEvent<HTMLAnchorElement>) => onUpdate?.(key, e.currentTarget.textContent ?? "", nodeContent?.prop)}
          style={{ ...nodeStyle, outline: "none" }}
        >
          {nodeContent?.value ?? ""}
        </a>
        {isEditable && (
          <>
            <button type="button" onClick={(event) => { event.stopPropagation(); setIsLinkMenuOpen(open => !open); }} className="absolute top-0 z-20 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/95 text-slate-600 opacity-100 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:opacity-0 md:group-hover/link:opacity-100 md:group-focus-within/link:opacity-100 print:hidden" style={{ right: "-20px" }} aria-label="Open link actions" aria-expanded={isLinkMenuOpen} title="Link actions"><FiMoreVertical size={16} aria-hidden /></button>
            {isLinkMenuOpen && (
              <div className="absolute z-30 mt-1 min-w-32 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm text-slate-700 shadow-xl print:hidden" style={{ right: "-20px", top: "28px" }}>
                <button type="button" onClick={(event) => { event.stopPropagation(); editLinkHref(); setIsLinkMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-slate-50">Edit href</button>
              </div>
            )}
          </>
        )}
      </span>
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
          }
            : undefined}
        className={`group/repeatable relative pe-8 ${common.className}`}
      >
        {nodeContent?.value && <span contentEditable={isEditable} suppressContentEditableWarning onBlur={(e: React.FocusEvent<HTMLElement>) => onUpdate?.(key, e.currentTarget.textContent ?? "")} className="outline-none">{nodeContent.value}</span>}
        {children}
        {isEditable && <RepeatableItemActions nodeId={node.id} onDeleteListItem={onDeleteListItem} onDuplicateListItem={onDuplicateListItem} onMoveListItem={onMoveListItem} isMenuOpen={isRepeatableMenuOpen} setIsMenuOpen={setIsRepeatableMenuOpen} />}
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
