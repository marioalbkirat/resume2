// D:\cvBuilder\resumebuilder\src\hooks\Canava\jsonToHtml\NodeRenderer.tsx
"use client";
import { ICON_MAP } from "@/hooks/PickIcons/icons";
import { Schema } from "@/types/resume/Schema";
import { Content } from "@/types/resume/Content";
import Image from "next/image";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { useState } from "react";
import Swal from "sweetalert2";

type NodeRendererProps = {
    node: Schema;
    sectionId: string;
    content?: Record<string, Content>;
    isEditable?: boolean;
    onUpdate?: (nodeId: string, value: string, props?: Record<string, string>) => void;
    onAddNode?: (parentId: string) => void;
    onDeleteNode?: (nodeId: string) => void;
    onSelectNode?: (nodeId: string) => void;
    isSelected?: boolean;
    level?: number;
    showActions?: boolean;
};

export default function NodeRenderer({
    node,
    sectionId,
    content,
    isEditable = true,
    onUpdate,
    onAddNode,
    onDeleteNode,
    onSelectNode,
    isSelected = false,
    level = 0,
    showActions = false
}: NodeRendererProps) {
    const nodeContent = content?.[node.id] || null;
    const Tag = node.tag as keyof JSX.IntrinsicElements;
    const hasChildren = node.children && node.children.length > 0;
    const isListContainer = node.tag === 'ul' || node.tag === 'ol';
    const isListItem = node.tag === 'li';

    // ✅ العناصر التي لها قيمة
    const hasValue = !['section', 'div', 'ul', 'ol', 'li'].includes(node.tag);
    const isInlineElement = ['i', 'span', 'a', 'img'].includes(node.tag);
    
    const hasListChild = node.children?.some(child => child.tag === 'ul' || child.tag === 'ol') || false;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isEditable && onSelectNode) {
            onSelectNode(node.id);
        }
    };

    const handleAddChild = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onAddNode) {
            onAddNode(node.id);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onDeleteNode) {
            onDeleteNode(node.id);
        }
    };

    const handleIconChange = async () => {
        if (!isEditable || !onUpdate) return;

        try {
            const result = await Swal.fire({
                title: 'Select Icon',
                input: 'text',
                inputValue: nodeContent?.value || node.value || 'FaUser',
                showCancelButton: true,
                confirmButtonText: 'Update',
                inputPlaceholder: 'e.g., FaUser, FaGithub, FaLinkedin',
                inputLabel: 'Enter icon name from Font Awesome:'
            });
            
            if (result.isConfirmed && result.value) {
                onUpdate(node.id, result.value);
            }
        } catch (error) {
            console.error('Error changing icon:', error);
        }
    };

    const handleValueChange = (e: React.FocusEvent<HTMLElement>) => {
        if (onUpdate && hasValue) {
            const newValue = e.currentTarget.textContent || '';
            onUpdate(node.id, newValue);
        }
    };

    const renderActions = () => {
        if (!isEditable) return null;
        
        const shouldShow = showActions || isListContainer || hasListChild;
        if (!shouldShow) return null;

        const actionButtons = [];

        if (isListContainer || hasListChild) {
            actionButtons.push(
                <button
                    key="add"
                    onClick={handleAddChild}
                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-all"
                    title="Add item"
                    type="button"
                >
                    <FiPlus size={14} />
                </button>
            );
        }

        if (node.tag !== 'section') {
            actionButtons.push(
                <button
                    key="delete"
                    onClick={handleDelete}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                    title="Delete item"
                    type="button"
                >
                    <FiTrash2 size={14} />
                </button>
            );
        }

        if (node.tag === 'i' && isEditable) {
            actionButtons.push(
                <button
                    key="edit-icon"
                    onClick={handleIconChange}
                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all"
                    title="Change icon"
                    type="button"
                >
                    <FiEdit2 size={14} />
                </button>
            );
        }

        if (actionButtons.length === 0) return null;

        return (
            <span className="action-buttons inline-flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 px-1 py-0.5 ml-2">
                {actionButtons}
            </span>
        );
    };

    // ✅ عرض الأيقونات
    if (node.tag === 'i') {
        const iconName = nodeContent?.value || node.value || 'FaUser';
        const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP];
        return (
            <span
                className={`inline-block relative ${isSelected ? 'ring-2 ring-blue-500 rounded p-1' : ''}`}
                onClick={handleClick}
                style={{ cursor: isEditable ? 'pointer' : 'default' }}
            >
                {IconComponent ? <IconComponent /> : <span>🔹</span>}
                {renderActions()}
            </span>
        );
    }

    // ✅ عرض الصور
    if (node.tag === 'img') {
        return (
            <span
                className={`relative inline-block ${isSelected ? 'ring-2 ring-blue-500 rounded' : ''}`}
                onClick={handleClick}
            >
                <Image
                    src={nodeContent?.value || node.value || '/placeholder.png'}
                    alt={node.name}
                    width={100}
                    height={100}
                    style={{ objectFit: 'contain' }}
                />
                {renderActions()}
            </span>
        );
    }

    // ✅ عرض الأطفال
    const renderChildren = () => {
        if (!hasChildren) return null;
        return node.children.map((child) => (
            <NodeRenderer
                key={child.id}
                node={child}
                sectionId={sectionId}
                content={content}
                isEditable={isEditable}
                onUpdate={onUpdate}
                onAddNode={onAddNode}
                onDeleteNode={onDeleteNode}
                onSelectNode={onSelectNode}
                isSelected={isSelected}
                level={level + 1}
                showActions={showActions || isListContainer || hasListChild}
            />
        ));
    };

    // ✅ عرض العقدة
    const renderNode = () => {
        // ✅ عناصر القائمة
        if (isListItem) {
            return (
                <li
                    className={`relative pl-4 ${isSelected ? 'ring-2 ring-blue-500 rounded' : ''}`}
                    onClick={handleClick}
                    style={{ cursor: isEditable ? 'pointer' : 'default', position: 'relative' }}
                >
                    <span className="absolute left-0">•</span>
                    {/* ✅ عرض القيمة فقط إذا كانت موجودة */}
                    {hasValue && nodeContent?.value && (
                        <span
                            contentEditable={isEditable}
                            suppressContentEditableWarning
                            onBlur={handleValueChange}
                            className="outline-none"
                        >
                            {nodeContent.value}
                        </span>
                    )}
                    {renderChildren()}
                    {renderActions()}
                </li>
            );
        }

        // ✅ الحاويات (sections, divs)
        if (['section', 'div'].includes(node.tag)) {
            return (
                <Tag
                    className={`relative ${isSelected ? 'ring-2 ring-blue-500 rounded' : ''}`}
                    onClick={handleClick}
                    style={{ cursor: isEditable ? 'pointer' : 'default', position: 'relative' }}
                >
                    {renderChildren()}
                    {renderActions()}
                </Tag>
            );
        }

        // ✅ القوائم (ul, ol)
        if (['ul', 'ol'].includes(node.tag)) {
            return (
                <Tag
                    className={`relative ${isSelected ? 'ring-2 ring-blue-500 rounded' : ''}`}
                    onClick={handleClick}
                    style={{ cursor: isEditable ? 'pointer' : 'default', position: 'relative' }}
                >
                    {renderChildren()}
                    {renderActions()}
                </Tag>
            );
        }

        // ✅ العناصر المضمنة (span, a)
        if (isInlineElement) {
            const TagElement = Tag;
            return (
                <TagElement
                    className={`relative inline-block ${isSelected ? 'ring-2 ring-blue-500 rounded' : ''}`}
                    onClick={handleClick}
                    contentEditable={isEditable && hasValue}
                    suppressContentEditableWarning
                    onBlur={handleValueChange}
                    style={{ 
                        cursor: isEditable ? 'pointer' : 'default', 
                        position: 'relative', 
                        outline: 'none',
                        display: 'inline-block'
                    }}
                >
                    {/* ✅ عرض القيمة فقط إذا كانت موجودة */}
                    {hasValue ? nodeContent?.value || '' : renderChildren()}
                    {renderActions()}
                </TagElement>
            );
        }

        // ✅ العناصر العادية (p, h1, h2, etc.)
        const TagElement = Tag;
        return (
            <TagElement
                className={`relative ${isSelected ? 'ring-2 ring-blue-500 rounded' : ''}`}
                onClick={handleClick}
                contentEditable={isEditable && hasValue}
                suppressContentEditableWarning
                onBlur={handleValueChange}
                style={{ 
                    cursor: isEditable ? 'pointer' : 'default', 
                    position: 'relative', 
                    outline: 'none' 
                }}
            >
                {/* ✅ عرض القيمة فقط إذا كانت موجودة */}
                {hasValue ? nodeContent?.value || '' : renderChildren()}
                {renderActions()}
            </TagElement>
        );
    };

    return renderNode();
}