// D:\cvBuilder\resumebuilder\src\hooks\sectionBuilder\SectionPreview.tsx
import defaultStyles from "@/defaultStyle";
import * as Icons from "react-icons/fa";
import React, { CSSProperties, JSX } from "react";
import { Schema } from "@/types/resume/Section";
import { IconType } from "react-icons";
import { Content } from "@/types/resume/Content";
import { useSectionBuilder } from "./useSectionBuilder";

const iconMap: Record<string, IconType> = {};
Object.keys(Icons).forEach((key) => {
    if (key.startsWith("Fa")) {
        iconMap[key] = Icons[key as keyof typeof Icons] as IconType;
    }
});

const getStyle = (tag: string): CSSProperties => {
    return defaultStyles[tag as keyof typeof defaultStyles] || {};
};

interface NodeRendererProps { 
    node: Schema; 
    getContent: (id: string) => Content | null; 
}

const NodeRenderer = ({ node, getContent }: NodeRendererProps) => {
    if (!node) return null;
    const { tag, children, name, id } = node;
    const content = getContent(id);
    const value = content?.value || '';
    const props = content?.prop || {};
    const style: CSSProperties = getStyle(tag);

    if (tag === 'i') {
        const IconComponent = iconMap[value as string];
        if (IconComponent) {
            return (
                <IconComponent
                    style={style}
                    data-id={id}
                    data-name={name}
                    data-icon={value}
                />
            );
        }
        return <span style={style} data-id={id} data-name={name}>🔹</span>;
    }

    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        const Tag = tag as keyof JSX.IntrinsicElements;
        return <Tag style={style} data-id={id} data-name={name} className={tag}>{value}</Tag>;
    }

    if (tag === 'li') {
        const Tag = tag as keyof JSX.IntrinsicElements;
        return (
            <Tag style={style} data-id={id} data-name={name} className={tag}>
                {children?.map((child: Schema) => (
                    <NodeRenderer key={child.id} node={child} getContent={getContent} />
                ))}
            </Tag>
        );
    }

    if (tag === 'ul') {
        const Tag = tag as keyof JSX.IntrinsicElements;
        return (
            <Tag style={style} data-id={id} data-name={name} className={tag}>
                {children?.map((child: Schema) => (
                    <NodeRenderer key={child.id} node={child} getContent={getContent} />
                ))}
            </Tag>
        );
    }

    if (tag === "img") {
        const Tag = tag as keyof JSX.IntrinsicElements;
        return (
            <Tag
                alt={props.alt as string || "Image"}
                src={props.src as string || ""}
                style={style}
                data-id={id}
                data-name={name}
                className={tag}
            />
        );
    }

    if (tag === "a") {
        const Tag = tag as keyof JSX.IntrinsicElements;
        return (
            <Tag href={props.href as string || "#"} style={style} data-id={id} data-name={name} className={tag}>
                {value}
            </Tag>
        );
    }

    const Tag = tag as keyof JSX.IntrinsicElements;
    return (
        <Tag style={style} data-id={id} data-name={name} className={tag}>
            {value}
            {children?.map((child: Schema) => (
                <NodeRenderer key={child.id} node={child} getContent={getContent} />
            ))}
        </Tag>
    );
};

interface SectionPreviewProps { 
    builder: ReturnType<typeof useSectionBuilder>; 
}

export default function SectionPreview({ builder }: SectionPreviewProps) {
    const { schema, getContent } = builder;
    if (!schema) return <div className="text-gray-400 text-center py-8">No section to preview</div>;
    
    const sectionStyle: CSSProperties = getStyle('section');
    
    return (
        <div className="section-preview">
            <section
                style={sectionStyle}
                data-name={schema.name || 'Untitled'}
                className="section"
            >
                {schema.children?.map((child: Schema) => (
                    <NodeRenderer key={child.id} node={child} getContent={getContent} />
                ))}
            </section>
        </div>
    );
}