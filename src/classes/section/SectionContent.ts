// D:\cvBuilder\resumebuilder\src\classes\section\SectionContent.ts
import { Content } from "@/types/resume/Content";
export class SectionContent {
    createContent(content: Record<string, Content>, nodeId: string, type: string, value: string = '', props?: Record<string, string>): Record<string, Content> {
        if (content[nodeId]) return content;
        const newContent: Content = {
            id: nodeId,
            type: type,
            value: value,
            prop: props || {},
        };
        return { ...content, [nodeId]: newContent };
    }
    getContent(content: Record<string, Content>, nodeId: string): Content | null {
        return content[nodeId] || null;
    }
    updateContentValue(content: Record<string, Content>, nodeId: string, value: string): Record<string, Content> {
        if (!content[nodeId]) return content;
        return {
            ...content,
            [nodeId]: {
                ...content[nodeId],
                value: value
            }
        };
    }
    updateContentProps(content: Record<string, Content>, nodeId: string, props: Record<string, string>): Record<string, Content> {
        if (!content[nodeId]) return content;
        return {
            ...content,
            [nodeId]: {
                ...content[nodeId],
                prop: { ...content[nodeId].prop, ...props }
            }
        };
    }
    deleteContent(content: Record<string, Content>, nodeId: string): Record<string, Content> {
        const newContent = { ...content };
        delete newContent[nodeId];
        return newContent;
    }
    getDefaultContent(type: string): { value: string; props: Record<string, string> } {
        const defaults: Record<string, { value: string; props: Record<string, string> }> = {
            image: {
                value: '/images/user-photo.avif',
                props: { src: '/images/user-photo.avif', alt: 'Image' }
            },
            link: {
                value: 'Link Text',
                props: { href: 'https://example.com' }
            },
            icon: {
                value: 'FaUser',
                props: {}
            },
            heading: {
                value: 'Heading Text',
                props: {}
            },
            text: {
                value: 'Text content',
                props: {}
            },
            paragraph: {
                value: 'Paragraph content',
                props: {}
            },
            list: {
                value: '',
                props: {}
            },
            listItem: {
                value: '',
                props: {}
            },
            container: {
                value: '',
                props: {}
            },
            section: {
                value: '',
                props: {}
            }
        };
        return defaults[type] || { value: '', props: {} };
    }
    toArray(content: Record<string, Content>): Content[] {
        return Object.values(content);
    }
}