import { Content } from "@/types/resume/Content";
import { SectionSchema } from "./SectionSchema";
import { SectionValidation } from "./SectionValidation";

export class SectionContent {
    private schemaControl = new SectionSchema();
    private validation = new SectionValidation();

    createContent(content: Record<string, Content>, nodeId: string, tag: string, type: string, value = "", props?: Record<string, string>): Record<string, Content> {
        if (content[nodeId] || this.schemaControl.getTagsWithoutValue().includes(tag)) return content;
        const defaults = this.getDefaultContent(type);
        const prop = { ...defaults.props, ...(props ?? {}) };
        const nextValue = this.validation.validateContentValue(tag, value || defaults.value);
        if (!["img", "i"].includes(tag) && prop.title) prop.title = this.validation.validateFieldTitle(prop.title);
        if (tag === "img") {
            prop.src = prop.src || nextValue;
            prop.alt = prop.alt || "Image";
        }
        if (tag === "a") prop.href = prop.href || "https://example.com";
        return { ...content, [nodeId]: { id: nodeId, type, value: nextValue, prop } };
    }

    getContent(content: Record<string, Content>, nodeId: string): Content | null { return content[nodeId] || null; }

    updateContentValue(content: Record<string, Content>, nodeId: string, tag: string, value: string): Record<string, Content> {
        if (!content[nodeId]) return content;
        return { ...content, [nodeId]: { ...content[nodeId], value: this.validation.validateContentValue(tag, value) } };
    }

    updateContentProps(content: Record<string, Content>, nodeId: string, props: Record<string, string>): Record<string, Content> {
        if (!content[nodeId]) return content;
        return { ...content, [nodeId]: { ...content[nodeId], prop: { ...content[nodeId].prop, ...props } } };
    }

    deleteContent(content: Record<string, Content>, nodeId: string): Record<string, Content> {
        const newContent = { ...content };
        delete newContent[nodeId];
        return newContent;
    }

    getDefaultContent(type: string): { value: string; props: Record<string, string> } {
        const defaults: Record<string, { value: string; props: Record<string, string> }> = {
            image: { value: "/images/user-photo.avif", props: { src: "/images/user-photo.avif", alt: "Image" } },
            link: { value: "Link Text", props: { href: "https://example.com", title: "Link title" } },
            icon: { value: "FaUser", props: {} },
            heading: { value: "Heading Text", props: { title: "Heading field" } },
            text: { value: "Text content", props: { title: "Text field" } },
            paragraph: { value: "Paragraph content", props: { title: "Paragraph field" } },
        };
        return defaults[type] || { value: "", props: {} };
    }

    toArray(content: Record<string, Content>): Content[] { return Object.values(content); }
}
