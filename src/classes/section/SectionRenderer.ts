import { Schema } from "@/types/resume/Section";

type RenderableSchema = Schema & { value?: string };
export class SectionRenderer {
    private section: RenderableSchema;
    constructor(section: RenderableSchema) {
        this.section = section;
    }
    renderSection(node: RenderableSchema): string {
        if (!node) return '';
        switch (node.type) {
            case 'section':
                return this.renderContainer(node);
            case 'heading':
                return this.renderHeading(node);
            case 'list':
                return this.renderList(node);
            case 'listItem':
                return this.renderListItem(node);
            case 'icon':
                return this.renderIcon(node);
            case 'text':
                return this.renderText(node);
            default:
                return this.renderGeneric(node);
        }
    }
    private renderContainer(node: RenderableSchema): string {
        const childrenHtml = node.children.map(child => this.renderSection(child)).join('');
        return `<${node.tag} class="${node.tag}" data-id="${node.id}" data-name="${node.name}">\n${childrenHtml}\n</${node.tag}>`;
    }
    private renderHeading(node: RenderableSchema): string {
        return `<${node.tag} class="${node.tag}" data-id="${node.id}" data-name="${node.name}">${this.escapeHtml(node.value || '')}</${node.tag}>`;
    }
    private renderList(node: RenderableSchema): string {
        const childrenHtml = node.children.map(child => this.renderSection(child)).join('\n');
        return `<${node.tag} class="${node.tag}" data-id="${node.id}" data-name="${node.name}">\n${childrenHtml}\n</${node.tag}>`;
    }
    private renderListItem(node: RenderableSchema): string {
        const childrenHtml = node.children.map(child => this.renderSection(child)).join('');
        return `<${node.tag} class="${node.tag}" data-id="${node.id}" data-name="${node.name}">${childrenHtml}</${node.tag}>`;
    }
    private renderIcon(node: RenderableSchema): string {
        const iconName = node.value;
        if (iconName) return `<i class="${node.tag}" data-icon="${iconName}" data-id="${node.id}" data-name="${node.name}"></i>`;
        return `<${node.tag} class="${node.tag}" data-id="${node.id}" data-name="${node.name}"></${node.tag}>`;
    }
    private renderText(node: RenderableSchema): string {
        const value = node.value || '';
        return `<${node.tag} class="${node.tag}" data-id="${node.id}" data-name="${node.name}">${this.escapeHtml(value)}</${node.tag}>`;
    }
    private renderGeneric(node: RenderableSchema): string {
        const isTextElement = ["span", "text", "a", "h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tag);
        const childrenHtml = isTextElement ? "" : node.children.map(child => this.renderSection(child)).join('');
        const value = node.value || '';
        const content = childrenHtml || this.escapeHtml(value);
        return `<${node.tag} class="${node.tag}" data-id="${node.id}" data-name="${node.name}">${content}</${node.tag}>`;
    }
    private escapeHtml(text: string): string {
        const htmlEntities: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
    }
    render(): string {
        return this.renderSection(this.section);
    }
    renderWithWrapper(wrapperTag: string = 'div', wrapperClass?: string): string {
        const content = this.render();
        const classAttr = wrapperClass ? ` class="${wrapperClass}"` : '';
        return `<${wrapperTag}${classAttr} data-section-id="${this.section.id}">\n${content}\n</${wrapperTag}>`;
    }
}