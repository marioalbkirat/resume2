import { SchemaNode } from "@/types/resume/schemaSection";
export class SectionRenderer {
    private section: SchemaNode;
    constructor(section: SchemaNode) {
        this.section = section;
    }
    renderSection(node: SchemaNode): string {
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
    private renderContainer(node: SchemaNode): string {
        const childrenHtml = node.children.map(child => this.renderSection(child)).join('');
        return `<${node.tag} class="${node.selectorGroup}" data-id="${node.id}" data-name="${node.name}">\n${childrenHtml}\n</${node.tag}>`;
    }
    private renderHeading(node: SchemaNode): string {
        const childrenHtml = node.children.map(child => this.renderSection(child)).join('');
        return `<${node.tag} class="${node.selectorGroup}" data-id="${node.id}" data-name="${node.name}">${childrenHtml}${node.value || ''}</${node.tag}>`;
    }
    private renderList(node: SchemaNode): string {
        const childrenHtml = node.children.map(child => this.renderSection(child)).join('\n');
        return `<${node.tag} class="${node.selectorGroup}" data-id="${node.id}" data-name="${node.name}">\n${childrenHtml}\n</${node.tag}>`;
    }
    private renderListItem(node: SchemaNode): string {
        const childrenHtml = node.children.map(child => this.renderSection(child)).join('');
        return `<${node.tag} class="${node.selectorGroup}" data-id="${node.id}" data-name="${node.name}">${childrenHtml}</${node.tag}>`;
    }
    private renderIcon(node: SchemaNode): string {
        const iconName = node.value;
        if (iconName) return `<i class="${node.selectorGroup}" data-icon="${iconName}" data-id="${node.id}" data-name="${node.name}"></i>`;
        return `<${node.tag} class="${node.selectorGroup}" data-id="${node.id}" data-name="${node.name}"></${node.tag}>`;
    }
    private renderText(node: SchemaNode): string {
        const value = node.value || '';
        return `<${node.tag} class="${node.selectorGroup}" data-id="${node.id}" data-name="${node.name}">${this.escapeHtml(value)}</${node.tag}>`;
    }
    private renderGeneric(node: SchemaNode): string {
        const childrenHtml = node.children.map(child => this.renderSection(child)).join('');
        const value = node.value || '';
        const content = childrenHtml || value;
        return `<${node.tag} class="${node.selectorGroup}" data-id="${node.id}" data-name="${node.name}">${content}</${node.tag}>`;
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