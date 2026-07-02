// hooks/Canava/jsonToHtml/sectionToHtml.tsx
"use client";
import { ICON_MAP } from "@/hooks/PickIcons/icons";
import { SchemaNode } from "@/types/resume/schemaSection";
import { SectionStyle } from "@/types/resume/SectionStyle";
import Image from "next/image";
import { useEffect } from "react";

type Props = {
    node: SchemaNode;
    id: string;
    style?: SectionStyle;
    onUpdate: (id: string, value: string) => void;
    onElementClick?: (nodeId: string) => void;
    selectedNodeId?: string | null;
    // For tracking if this is a child of a selected section
    isChildOfSelected?: boolean;
};

export default function NodeRenderer({
    node,
    id,
    style,
    onUpdate,
    onElementClick,
    selectedNodeId,
    isChildOfSelected = false,
}: Props) {
    const Tag = node.tag as keyof JSX.IntrinsicElements;

    // Check if this specific node is selected
    const isSelected = style?.id === selectedNodeId;

    // Check if any parent is selected (to style children differently)
    const isParentSelected = isChildOfSelected && !isSelected;

    // Combine styles with selection indicators
    const combinedStyle = {
        ...style?.style,
        // Add selection styles
        ...(isSelected && {
            outline: '2px solid #3b82f6',
            outlineOffset: '2px',
            position: 'relative' as const,
        }),
        // Add hover effect when clickable
        ...(onElementClick && {
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        }),
    };

    // Handle click
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling
        if (onElementClick && style?.id) {
            onElementClick(style.id);
        }
    };

    // For debugging - remove in production
    useEffect(() => {
        if (isSelected) {
        }
    }, [isSelected, node]);

    if (Tag === 'i') {
        const Icon = ICON_MAP[node.value];
        if (!Icon) return null;

        return (
            <span
                onClick={handleClick}
                style={{
                    cursor: onElementClick ? 'pointer' : 'default',
                    ...(isSelected && {
                        outline: '2px solid #3b82f6',
                        outlineOffset: '2px',
                        padding: '2px',
                        borderRadius: '4px',
                    })
                }}
            >
                <Icon />
            </span>
        );
    }

    if (Tag === "img") {
        return (
            <div
                onClick={handleClick}
                style={{
                    display: 'inline-block',
                    ...(isSelected && {
                        outline: '2px solid #3b82f6',
                        outlineOffset: '2px',
                        borderRadius: '4px',
                    })
                }}
            >
                <Image
                    src={node.value ?? ""}
                    alt={node.name}
                    width={100}
                    height={100}
                    style={style?.style}
                />
            </div>
        );
    }

    const editableTypes = [
        "text",
        "heading",
        "paragraph",
        "link",
    ];

    const isEditable = editableTypes.includes(node.type);

    // Render children with context
    const renderChildren = () => {
        return node.children.map((child) => {
            const childStyle = style?.children?.find(
                (s) => s.id === child.id
            );

            return (
                <NodeRenderer
                    key={child.id}
                    id={child.id}
                    node={child}
                    style={childStyle}
                    onUpdate={onUpdate}
                    onElementClick={onElementClick}
                    selectedNodeId={selectedNodeId}
                    isChildOfSelected={isSelected || isChildOfSelected}
                />
            );
        });
    };

    // For section tags, add a special wrapper to handle selection
    if (Tag === "section") {
        return (
            <section
                key={id}
                style={combinedStyle}
                onClick={handleClick}
                className={`build-node ${isSelected ? 'selected-node' : ''}`}
                data-node-id={style?.id}
            >
                {node.value}
                {renderChildren()}
            </section>
        );
    }

    return (
        <Tag
            key={id}
            style={combinedStyle}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onClick={handleClick}
            className={`build-node ${isSelected ? 'selected-node' : ''}`}
            data-node-id={style?.id}
            onBlur={(e) => {
                if (!isEditable) return;
                onUpdate(
                    node.id,
                    e.currentTarget.textContent ?? ""
                );
            }}
        >
            {node.value}
            {renderChildren()}
        </Tag>
    );
}