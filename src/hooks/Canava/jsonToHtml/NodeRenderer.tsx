"use client";

import IconPreview from "@/hooks/PickIcons/icons/IconPreview";
import type { IconItem } from "@/hooks/PickIcons/icons";
import { getIconMetadata } from "@/hooks/PickIcons/icons";
import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import Image from "next/image";
import dynamic from "next/dynamic";
import { CSSProperties, ElementType, useEffect, useRef, useState } from "react";
import { ResumeStyle, StyleObject } from "@/types/resume/ResumeStyle";
import { FiChevronDown, FiChevronUp, FiCopy, FiEdit2, FiEyeOff, FiMoreVertical, FiPlus, FiTrash2 } from "react-icons/fi";

const PickIcons = dynamic(() => import("@/hooks/PickIcons/icons/PickIcons"), { ssr: false });

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
  onAddChildNode?: (parentId: string) => void;
  sectionActions?: { onHide?: () => void; onDuplicate?: () => void; onToggleIcon?: () => void };
  style?: ResumeStyle;
  ancestors?: string[];
  repeatableListId?: string;
  repeatableItemId?: string;
};

const TEXTLESS_TAGS = new Set(["section", "div", "ul", "ol"]);
const NO_MENU_TAGS = new Set(["div", "li", "ul", "ol", "i", "img"]);
const TEXT_TAGS = new Set(["p", "span", "h1", "h2", "h3", "h4", "h5", "h6"]);
const contentKeyFor = (node: Schema) => node.id;
const asCssProperties = (style?: StyleObject) => (style ?? {}) as CSSProperties;
const borderLonghandPattern = /^border(Top|Right|Bottom|Left)(Width|Style|Color)?$/;
const borderAxisPattern = /^border(Width|Style|Color)$/;
const normalizeBorderStyle = (style: CSSProperties) => {
  const next = { ...style } as CSSProperties & Record<string, unknown>;
  const hasSideBorder = Object.keys(next).some((key) => borderLonghandPattern.test(key));
  if (hasSideBorder) {
    delete next.border;
    Object.keys(next).forEach((key) => { if (borderAxisPattern.test(key)) delete next[key]; });
  }
  return next as CSSProperties;
};
const selectorKeysFor = (node: Schema) => {
  const keys = [node.tag];
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

type Action = { label: string; icon: React.ReactNode; danger?: boolean; run: () => void };
function HoverMenu({ nodeId, actions, onSelectNode }: { nodeId: string; actions: Action[]; onSelectNode?: (nodeId: string) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeMenu = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [open]);
  if (!actions.length) return null;
  return <div ref={menuRef} className="absolute end-0 top-0 z-20 print:hidden">
    <button type="button" onClick={(event) => { event.stopPropagation(); setOpen(v => !v); onSelectNode?.(nodeId); }} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 md:opacity-0 md:group-hover/canvas-node:opacity-100 md:group-focus-within/canvas-node:opacity-100" aria-label="Open node actions"><FiMoreVertical /></button>
    {open && <div className="absolute end-0 mt-1 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm text-slate-700 shadow-xl">
      {actions.map(action => <button key={action.label} type="button" onClick={(event) => { event.stopPropagation(); action.run(); setOpen(false); }} className={`flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-slate-50 ${action.danger ? "text-red-600 hover:bg-red-50" : ""}`}>{action.icon}{action.label}</button>)}
    </div>}
  </div>;
}

function useEditOutsideClose(editing: boolean, setEditing: (editing: boolean) => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!editing) return;
    const close = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setEditing(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [editing, ref, setEditing]);
}

export default function NodeRenderer({ node, sectionId, content = {}, isEditable = true, selectedNodeId, showIcons = true, showSectionIcons = true, direction = "LTR", onUpdate, onAddListItem, onDeleteListItem, onDuplicateListItem, onMoveListItem, onSelectNode, onAddChildNode, sectionActions, style, ancestors = [], repeatableListId, repeatableItemId }: NodeRendererProps) {
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const editableRef = useRef<HTMLElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEditOutsideClose(editing, setEditing, editableRef);

  if ((node.tag === "i" || node.tag === "svg") && !showIcons) return null;
  if ((node.tag === "i" || node.tag === "svg") && (node.role === "sectionIcon" || node.role === "sectionTitleIcon") && !showSectionIcons) return null;

  const key = contentKeyFor(node);
  const nodeContent = content[key];
  const hasText = !TEXTLESS_TAGS.has(node.tag);
  const isSelected = selectedNodeId === node.id;
  const Tag = node.tag as ElementType;
  const nodeStyle = getNodeStyle(node, style);
  const inRepeatable = ancestors.includes("ul") || ancestors.includes("li") || ancestors.includes("ol");

  const common = {
    dir: direction.toLowerCase(),
    "data-node-id": node.id,
    "data-section-id": sectionId,
    onClick: isEditable ? (event: React.MouseEvent<HTMLElement>) => { event.stopPropagation(); onSelectNode?.(node.id); } : undefined,
    className: `${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""} ${isEditable ? "cursor-pointer" : ""}`,
    style: nodeStyle,
  };

  const nextRepeatableListId = node.tag === "ul" || node.tag === "ol" ? node.id : repeatableListId;
  const nextRepeatableItemId = node.tag === "li" ? node.id : repeatableItemId;
  const children = node.children?.map((child) => <NodeRenderer key={child.id} node={child} sectionId={sectionId} content={content} isEditable={isEditable} selectedNodeId={selectedNodeId} showIcons={showIcons} showSectionIcons={showSectionIcons} direction={direction} onUpdate={onUpdate} onAddListItem={onAddListItem} onDeleteListItem={onDeleteListItem} onDuplicateListItem={onDuplicateListItem} onMoveListItem={onMoveListItem} onSelectNode={onSelectNode} onAddChildNode={onAddChildNode} sectionActions={sectionActions} style={style} ancestors={[...ancestors, node.tag]} repeatableListId={nextRepeatableListId} repeatableItemId={nextRepeatableItemId} />);

  const actions: Action[] = isEditable && !NO_MENU_TAGS.has(node.tag) ? node.tag === "section" ? [
    { label: "Hide Section", icon: <FiEyeOff />, run: () => sectionActions?.onHide?.() },
    { label: "Add Element", icon: <FiPlus />, run: () => onAddChildNode?.(node.id) },
    { label: "Add Child", icon: <FiPlus />, run: () => onAddChildNode?.(node.id) },
    { label: "Duplicate Section", icon: <FiCopy />, run: () => sectionActions?.onDuplicate?.() },
    { label: "Hide Icon", icon: <FiEyeOff />, run: () => sectionActions?.onToggleIcon?.() },
  ] : TEXT_TAGS.has(node.tag) && inRepeatable ? [
    { label: "Add Child", icon: <FiPlus />, run: () => repeatableListId && onAddListItem?.(repeatableListId) },
    { label: "Duplicate", icon: <FiCopy />, run: () => repeatableItemId && onDuplicateListItem?.(repeatableItemId) },
    { label: "Delete", icon: <FiTrash2 />, danger: true, run: () => repeatableItemId && onDeleteListItem?.(repeatableItemId) },
    { label: "Move Up", icon: <FiChevronUp />, run: () => repeatableItemId && onMoveListItem?.(repeatableItemId, "up") },
    { label: "Move Down", icon: <FiChevronDown />, run: () => repeatableItemId && onMoveListItem?.(repeatableItemId, "down") },
  ] : TEXT_TAGS.has(node.tag) ? [{ label: "Add Child", icon: <FiPlus />, run: () => onAddChildNode?.(node.id) }] : node.tag === "a" ? [
    { label: "Add Child", icon: <FiPlus />, run: () => onAddChildNode?.(node.id) },
    { label: "Edit", icon: <FiEdit2 />, run: () => setShowLinkEditor(true) },
  ] : [] : [];

  const withMenu = (element: React.ReactElement) => isEditable && actions.length ? <span className="group/canvas-node relative inline-block pe-8">{element}<HoverMenu nodeId={node.id} actions={actions} onSelectNode={onSelectNode} /></span> : element;

  if (node.tag === "i") {
    const iconName = nodeContent?.value || "FaUser";
    return <>
      <span {...common} onClick={isEditable ? (event) => { event.stopPropagation(); onSelectNode?.(node.id); setShowIconPicker(true); } : common.onClick} className={`inline-flex align-middle ${common.className}`}><IconPreview name={iconName} aria-hidden /></span>
      {showIconPicker && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowIconPicker(false)}><div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><PickIcons selectedIcon={getIconMetadata(iconName) ?? null} onSelect={(icon: IconItem) => { onUpdate?.(key, icon.name); setShowIconPicker(false); }} /></div></div>}
    </>;
  }

  if (node.tag === "img") {
    const upload = async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/resume/user-image", { method: "POST", body: formData });
      if (!response.ok) return;
      const data = await response.json() as { path: string };
      onUpdate?.(key, data.path, nodeContent?.prop);
    };
    return <><Image {...common} src={nodeContent?.value || "/placeholder.png"} alt={nodeContent?.prop?.alt || "Image"} width={100} height={100} onClick={isEditable ? (event) => { event.stopPropagation(); fileRef.current?.click(); } : undefined} />{isEditable && <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }} />}</>;
  }

  if (node.tag === "a") {
    const href = normalizeHref(nodeContent?.prop?.href || "#");
    const isExternalLink = /^https?:\/\//i.test(href);
    const anchor = <a {...common} ref={editableRef as React.Ref<HTMLAnchorElement>} href={isEditable ? undefined : href} data-pdf-link={!isEditable && href !== "#" ? href : undefined} target={!isEditable && isExternalLink ? "_blank" : undefined} rel={!isEditable && isExternalLink ? "noopener noreferrer" : undefined} contentEditable={isEditable ? true : undefined} suppressContentEditableWarning onFocus={() => setEditing(true)} onBlur={(e) => { setEditing(false); onUpdate?.(key, e.currentTarget.textContent ?? ""); }} style={{ ...nodeStyle, outline: "none" }}>{nodeContent?.value ?? ""}</a>;
    return <>{withMenu(anchor)}{showLinkEditor && <LinkEditor value={nodeContent?.value ?? ""} href={nodeContent?.prop?.href ?? ""} onClose={() => setShowLinkEditor(false)} onSave={(value, nextHref) => { onUpdate?.(key, value, { ...(nodeContent?.prop ?? {}), href: nextHref }); setShowLinkEditor(false); }} />}</>;
  }

  if (hasText) {
    const element = <Tag {...common} ref={editableRef} contentEditable={isEditable} suppressContentEditableWarning onFocus={() => setEditing(true)} onBlur={(e: React.FocusEvent<HTMLElement>) => { setEditing(false); onUpdate?.(key, e.currentTarget.textContent ?? ""); }} style={{ ...nodeStyle, outline: "none" }}>{nodeContent?.value ?? ""}</Tag>;
    return withMenu(element);
  }

  const container = <Tag {...common} className={`group/canvas-node relative ${common.className}`}>{children}{isEditable && actions.length ? <HoverMenu nodeId={node.id} actions={actions} onSelectNode={onSelectNode} /> : null}</Tag>;
  return container;
}

function LinkEditor({ value, href, onClose, onSave }: { value: string; href: string; onClose: () => void; onSave: (value: string, href: string) => void }) {
  const [nextValue, setNextValue] = useState(value);
  const [nextHref, setNextHref] = useState(href);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><h3 className="mb-4 text-lg font-bold text-slate-900">Edit Link</h3><label className="mb-1 block text-sm font-medium">Value</label><input className="mb-3 w-full rounded-lg border px-3 py-2" value={nextValue} onChange={(e) => setNextValue(e.target.value)} /><label className="mb-1 block text-sm font-medium">Href</label><input className="mb-5 w-full rounded-lg border px-3 py-2" value={nextHref} onChange={(e) => setNextHref(e.target.value)} /><div className="flex justify-end gap-2"><button className="rounded-lg bg-slate-100 px-4 py-2" onClick={onClose}>Cancel</button><button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={() => onSave(nextValue, nextHref)}>Save</button></div></div></div>;
}
