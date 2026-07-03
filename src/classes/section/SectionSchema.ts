// import { Schema } from "@/types/resume/Section";
// export class SectionSchema {
//     readonly tags: string[] = ["section", "div", "li", "ul", "img", 'i', "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
//     readonly alias: Record<string, string> = {
//         a: "link",
//         section: "section",
//         div: "container",
//         ul: "list",
//         li: "listItem",
//         img: "image",
//         i: "icon",
//         p: "paragraph",
//         span: "text",
//         h1: "heading",
//         h2: "heading",
//         h3: "heading",
//         h4: "heading",
//         h5: "heading",
//         h6: "heading",
//     };
//     readonly tagsWithoutValue: string[] = ["section", "div", "li", "ul"];
//     getNode(section: Schema, id: string): Schema | null {
//         const findNode = (node: Schema): Schema | null => {
//             if (node.id === id) return node;
//             for (const child of node.children) {
//                 const result = findNode(child);
//                 if (result) return result;
//             }
//             return null;
//         };
//         return findNode(section);
//     }
//     getParent(section: Schema, id: string): Schema | null {
//         const findParent = (node: Schema, parent: Schema | null = null): Schema | null => {
//             if (node.id === id) return parent;
//             for (const child of node.children) {
//                 const result = findParent(child, node);
//                 if (result) return result;
//             }
//             return null;
//         };
//         return findParent(section);
//     }
//     allowedTagChildren(tag: string): string[] {
//         if (tag === "img" || tag === 'i') return [];
//         if (tag === "ul") return ["li"];
//         if (tag === "li") return ["div", "ul", "img", 'i', "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
//         if (tag === "p") return ["span", "img", 'i', "a"];
//         if (tag === "span") return ["span", "img", 'i', "a"];
//         if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return ["span", "img", 'i', "a"];
//         if (tag === "a") return ["span", "img", 'i'];
//         return ["div", "ul", "img", 'i', "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
//     }
//     addNode(section: Schema, tag: string, name: string, parentId: string): Schema | null {
//         if (!section || !tag || !name || !parentId) return null;
//         if (typeof tag !== "string" || typeof name !== "string" || typeof parentId !== "string") return null;
//         if (!this.tags.includes(tag)) return null;
//         if (!parentId || typeof parentId !== "string" || parentId.length !== 36) return null;
//         const node: Schema | null = this.getNode(section, parentId);
//         if (!node) return null;
//         const allowedTagChildren = this.allowedTagChildren(node.tag);
//         if (allowedTagChildren.length < 1 || !allowedTagChildren.includes(tag)) return null;
//         const child: Schema = { id: this.generateId(), tag, type: this.alias[tag], selectorGroup: tag, name, children: [] };
//         node.children.push(child);
//         return section;
//     }
//     deleteNode(section: Schema, id: string): Schema | null {
//         if (section.id === id) return null;
//         const parent: null | Schema = this.getParent(section, id);
//         if (!parent) return null;
//         parent.children = parent.children.filter(child => child.id !== id);
//         return section;
//     }
//     updateNode(section: Schema, parentId: string, tag?: string, name?: string): Schema | null {
//         const node: Schema | null = this.getNode(section, parentId);
//         if (!node) return null;
//         if (tag !== undefined) {
//             node.tag = tag;
//             node.type = this.alias[tag];
//         }
//         if (name !== undefined) node.name = name;
//         return section;
//     }
//     generateId(): string {
//         return crypto.randomUUID();
//     }
//     getAlias() {
//         return this.alias;
//     }
//     getTagsWithoutValue() {
//         return this.tagsWithoutValue;
//     }
// }
// D:\cvBuilder\resumebuilder\src\classes\section\SectionSchema.ts

import { Schema } from "@/types/resume/Section";

export class SectionSchema {
    readonly tags: string[] = ["section", "div", "li", "ul", "img", 'i', "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
    readonly alias: Record<string, string> = {
        a: "link",
        section: "section",
        div: "container",
        ul: "list",
        li: "listItem",
        img: "image",
        i: "icon",
        p: "paragraph",
        span: "text",
        h1: "heading",
        h2: "heading",
        h3: "heading",
        h4: "heading",
        h5: "heading",
        h6: "heading",
    };
    readonly tagsWithoutValue: string[] = ["section", "div", "li", "ul"];
    getNode(section: Schema, id: string): Schema | null {
        if (section.id === id) return section;
        const findNode = (node: Schema): Schema | null => {
            if (node.id === id) return node;
            for (const child of node.children) {
                const result = findNode(child);
                if (result) return result;
            }
            return null;
        };
        return findNode(section);
    }

    getParent(section: Schema, id: string): Schema | null {
        if (section.id === id) return null;
        const findParent = (node: Schema, parent: Schema | null = null): Schema | null => {
            if (node.id === id) return parent;
            for (const child of node.children) {
                const result = findParent(child, node);
                if (result) return result;
            }
            return null;
        };
        return findParent(section);
    }

    allowedTagChildren(tag: string): string[] {
        if (tag === "img" || tag === 'i') return [];
        if (tag === "ul") return ["li"];
        if (tag === "li") return ["div", "ul", "img", 'i', "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
        if (tag === "p") return ["span", "img", 'i', "a"];
        if (tag === "span") return ["span", "img", 'i', "a"];
        if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return ["span", "img", 'i', "a"];
        if (tag === "a") return ["span", "img", 'i'];
        return ["div", "ul", "img", 'i', "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
    }

    addNode(section: Schema, tag: string, name: string, parentId: string, role: "default" | "sectionIcon" = "default"): { section: Schema; child: Schema } | null {
        if (!section || !tag || !name || !parentId) return null;
        if (typeof tag !== "string" || typeof name !== "string" || typeof parentId !== "string") return null;
        if (!this.tags.includes(tag)) return null;
        const parent: Schema | null = this.getNode(section, parentId);
        if (!parent) return null;
        const allowedTagChildren = this.allowedTagChildren(parent.tag);
        if (allowedTagChildren.length < 1 || !allowedTagChildren.includes(tag)) return null;
        const child: Schema = {
            id: this.generateId(),
            tag,
            type: this.alias[tag] || tag,
            role: tag === "i" ? role : undefined,
            selectorGroup: tag,
            name,
            children: [],
            parentId: parentId
        };
        parent.children.push(child);
        return { section, child };
    }

    deleteNode(section: Schema, id: string): Schema | null {
        if (section.id === id) return null;
        const parent: null | Schema = this.getParent(section, id);
        if (!parent) return null;
        parent.children = parent.children.filter(child => child.id !== id);
        return section;
    }

    updateNode(section: Schema, nodeId: string, tag?: string, name?: string, role?: "default" | "sectionIcon"): Schema | null {
        const node: Schema | null = this.getNode(section, nodeId);
        if (!node) return null;
        if (tag !== undefined) {
            node.tag = tag;
            node.type = this.alias[tag] || tag;
            if (tag !== "i") node.role = undefined;
        }
        if (role !== undefined && node.tag === "i") node.role = role;
        if (name !== undefined) node.name = name;
        return section;
    }

    generateId(): string {
        return crypto.randomUUID();
    }

    getAlias() {
        return this.alias;
    }

    getTagsWithoutValue() {
        return this.tagsWithoutValue;
    }
}