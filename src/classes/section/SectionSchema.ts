import { Schema, SectionRole } from "@/types/resume/Section";

export class SectionSchema {
    readonly tags: string[] = ["section", "div", "li", "ul", "img", "i", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
    readonly alias: Record<string, string> = {
        a: "link", section: "section", div: "container", ul: "list", li: "listItem", img: "image", i: "icon", p: "paragraph", span: "text",
        h1: "heading", h2: "heading", h3: "heading", h4: "heading", h5: "heading", h6: "heading",
    };
    readonly tagsWithoutValue: string[] = ["section", "div", "li", "ul"];

    getNode(section: Schema, id: string): Schema | null {
        if (section.id === id) return section;
        for (const child of section.children) {
            const result = this.getNode(child, id);
            if (result) return result;
        }
        return null;
    }

    getParent(section: Schema, id: string): Schema | null {
        if (section.id === id) return null;
        for (const child of section.children) {
            if (child.id === id) return section;
            const result = this.getParent(child, id);
            if (result) return result;
        }
        return null;
    }

    allowedTagChildren(tag: string): string[] {
        if (["img", "i", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6", "a"].includes(tag)) return [];
        if (tag === "ul") return ["li"];
        if (tag === "li") return ["div", "ul", "img", "i", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
        return ["div", "ul", "img", "i", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
    }

    addNode(section: Schema, tag: string, parentId: string, role: SectionRole = "regularIcon"): { section: Schema; child: Schema } | null {
        if (!section || !tag || !parentId || tag === "section" || !this.tags.includes(tag)) return null;
        const parent = this.getNode(section, parentId);
        if (!parent || !this.allowedTagChildren(parent.tag).includes(tag)) return null;
        const child: Schema = { id: this.generateId(), tag, type: this.alias[tag] || tag, role: tag === "i" ? this.normalizeRole(role) : undefined, children: [], parentId };
        parent.children.push(child);
        return { section, child };
    }

    deleteNode(section: Schema, id: string): Schema | null {
        if (section.id === id) return null;
        const parent = this.getParent(section, id);
        if (!parent) return null;
        parent.children = parent.children.filter(child => child.id !== id);
        return section;
    }

    updateNode(section: Schema, nodeId: string, tag?: string, role?: SectionRole): Schema | null {
        const node = this.getNode(section, nodeId);
        if (!node || node.tag === "section") return null;
        if (tag !== undefined) {
            if (tag === "section" || !this.tags.includes(tag)) return null;
            node.tag = tag;
            node.type = this.alias[tag] || tag;
            if (tag !== "i") node.role = undefined;
            if (this.allowedTagChildren(tag).length === 0) node.children = [];
        }
        if (role !== undefined && node.tag === "i") node.role = this.normalizeRole(role);
        return section;
    }

    generateId(): string { return crypto.randomUUID(); }
    getAlias() { return this.alias; }
    getTagsWithoutValue() { return this.tagsWithoutValue; }

    private normalizeRole(role: SectionRole): SectionRole {
        return role === "sectionIcon" || role === "sectionTitleIcon" ? "sectionTitleIcon" : "regularIcon";
    }
}
