// D:\cvBuilder\resumebuilder\src\hooks\sectionBuilder\useSectionBuilder.tsx
import { SectionSchema } from "@/classes/section/SectionSchema";
import { SectionContent } from "@/classes/section/SectionContent";
import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import { useMemo, useState, useCallback } from "react";

interface UseSectionBuilderProps { 
    initialSchema?: Schema; 
    initialContent?: Record<string, Content>; 
}

interface UseSectionBuilderReturn {
    schema: Schema;
    content: Record<string, Content>;
    addNode: (tag: string, type: string, name: string, parentId: string, value?: string, props?: Record<string, string>, role?: "default" | "sectionIcon") => void;
    deleteNode: (id: string) => void;
    updateNode: (id: string, tag?: string, name?: string, role?: "default" | "sectionIcon") => void;
    updateContent: (nodeId: string, value: string, props?: Record<string, string>) => void;
    getNode: (id: string) => Schema | null;
    getContent: (nodeId: string) => Content | null;
    getParent: (id: string) => Schema | null;
    getAllContent: () => Record<string, Content>;
    getAllContentArray: () => Content[]; // إضافة هذه الدالة للتوافق
    allowedTagChildren: (tag: string) => string[];
    getAlias: () => Record<string, string>;
    getTagsWithoutValue: () => string[];
    getNodeWithContent: (id: string) => { schema: Schema | null; content: Content | null };
    exportData: () => { schema: Schema; content: Record<string, Content> };
    resetBuilder: (newSchema?: Schema, newContent?: Record<string, Content>) => void;
}

export function useSectionBuilder({ initialSchema, initialContent = {} }: UseSectionBuilderProps = {}): UseSectionBuilderReturn {
    const [schema, setSchema] = useState<Schema>(() => initialSchema ?? { 
        id: crypto.randomUUID(), 
        tag: "section", 
        type: "section", 
        name: "Untitled", 
        selectorGroup: "section", 
        children: [] 
    });
    const [content, setContent] = useState<Record<string, Content>>(initialContent);
    
    const schemaControl = useMemo(() => new SectionSchema(), []);
    const contentControl = useMemo(() => new SectionContent(), []);

    const addNode = useCallback((tag: string, type: string, name: string, parentId: string, value?: string, props?: Record<string, string>, role: "default" | "sectionIcon" = "default") => {
        const schemaCopy = JSON.parse(JSON.stringify(schema));
        const result = schemaControl.addNode(schemaCopy, tag, name, parentId, role);
        if (!result) return;
        
        const { section, child } = result;
        setSchema(section);
        
        setContent(prevContent => {
            const existingContent = contentControl.getContent(prevContent, child.id);
            if (!existingContent) {
                const defaultContent = contentControl.getDefaultContent(type);
                return contentControl.createContent(
                    prevContent, 
                    child.id, 
                    type, 
                    value || defaultContent.value, 
                    props || defaultContent.props
                );
            } else {
                let updatedContent = prevContent;
                let needsUpdate = false;
                if (value && existingContent.value !== value) {
                    updatedContent = contentControl.updateContentValue(updatedContent, child.id, value);
                    needsUpdate = true;
                }
                if (props && Object.keys(props).length > 0) {
                    updatedContent = contentControl.updateContentProps(updatedContent, child.id, props);
                    needsUpdate = true;
                }
                return needsUpdate ? updatedContent : prevContent;
            }
        });
    }, [schema, schemaControl, contentControl]);

    const deleteNode = useCallback((id: string) => {
        if (id === schema.id) return;
        const schemaCopy = JSON.parse(JSON.stringify(schema));
        const result = schemaControl.deleteNode(schemaCopy, id);
        if (result) {
            setSchema(result);
            setContent(prevContent => contentControl.deleteContent(prevContent, id));
        }
    }, [schema, schemaControl, contentControl]);

    const updateNode = useCallback((id: string, tag?: string, name?: string, role?: "default" | "sectionIcon") => {
        setSchema(prevSchema => {
            const schemaCopy = JSON.parse(JSON.stringify(prevSchema));
            const result = schemaControl.updateNode(schemaCopy, id, tag, name, role);
            return result ?? prevSchema;
        });
    }, [schemaControl]);

    const updateContent = useCallback((nodeId: string, value: string, props?: Record<string, string>) => {
        setContent(prevContent => {
            const existingContent = contentControl.getContent(prevContent, nodeId);
            if (existingContent) {
                let updatedContent = prevContent;
                if (value !== undefined) {
                    updatedContent = contentControl.updateContentValue(updatedContent, nodeId, value);
                }
                if (props) {
                    updatedContent = contentControl.updateContentProps(updatedContent, nodeId, props);
                }
                return updatedContent;
            } else {
                const node = schemaControl.getNode(schema, nodeId);
                if (node) {
                    const defaultContent = contentControl.getDefaultContent(node.type);
                    return contentControl.createContent(
                        prevContent, 
                        nodeId, 
                        node.type, 
                        value || defaultContent.value, 
                        props || defaultContent.props
                    );
                }
                return prevContent;
            }
        });
    }, [schema, schemaControl, contentControl]);

    const getNode = useCallback((id: string) => {
        return schemaControl.getNode(schema, id);
    }, [schema, schemaControl]);

    const getContent = useCallback((nodeId: string) => {
        return contentControl.getContent(content, nodeId);
    }, [content, contentControl]);

    const getNodeWithContent = useCallback((id: string) => {
        const node = getNode(id);
        const contentItem = getContent(id);
        return { schema: node, content: contentItem };
    }, [getNode, getContent]);

    const getParent = useCallback((id: string) => {
        return schemaControl.getParent(schema, id);
    }, [schema, schemaControl]);

    const getAllContent = useCallback(() => {
        return content;
    }, [content]);

    const getAllContentArray = useCallback(() => {
        return contentControl.toArray(content);
    }, [content, contentControl]);

    const allowedTagChildren = useCallback((tag: string): string[] => {
        return schemaControl.allowedTagChildren(tag);
    }, [schemaControl]);

    const getAlias = useCallback(() => {
        return schemaControl.getAlias();
    }, [schemaControl]);

    const getTagsWithoutValue = useCallback(() => {
        return schemaControl.getTagsWithoutValue();
    }, [schemaControl]);

    const exportData = useCallback(() => {
        return {
            schema: JSON.parse(JSON.stringify(schema)),
            content: JSON.parse(JSON.stringify(content))
        };
    }, [schema, content]);

    const resetBuilder = useCallback((newSchema?: Schema, newContent?: Record<string, Content>) => {
        if (newSchema) {
            setSchema(newSchema);
        } else {
            setSchema({
                id: crypto.randomUUID(),
                tag: "section",
                type: "section",
                name: "Untitled",
                selectorGroup: "section",
                children: []
            });
        }
        setContent(newContent ?? {});
    }, []);

    return {
        schema,
        content,
        addNode,
        deleteNode,
        updateNode,
        updateContent,
        getNode,
        getContent,
        getParent,
        getAllContent,
        getAllContentArray,
        allowedTagChildren,
        getAlias,
        getTagsWithoutValue,
        getNodeWithContent,
        exportData,
        resetBuilder,
    };
}