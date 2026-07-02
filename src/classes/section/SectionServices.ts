import { Section } from "@/types/resume/Section";
import { CreateSection } from ".";

export class SectionServices {
    private static readonly API = "/api/admin/sections";

    constructor() { }
    async getSections(): Promise<Section[]> {
        try {
            const result = await fetch(SectionServices.API);
            if (result.ok) {
                return await result.json() as Section[];
            }
            return [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    async getSectionById(id: string): Promise<Section> {
        try {
            const result = await fetch(SectionServices.API + `/${id}`);
            if (result.ok) return await result.json() as Section;
            return {
                id: crypto.randomUUID(),
                tag: "section",
                type: "section",
                name: "Untitled",
                value: null,
                selectorGroup: "section",
                children: [],
            };
        } catch (error) {
            console.error(error);
            return {
                id: crypto.randomUUID(),
                tag: "section",
                type: "section",
                name: "Untitled",
                value: null,
                selectorGroup: "section",
                children: [],
            };
        }
    }
    async createSection(section: CreateSection): Promise<void> {
        try {
            const result = await fetch(SectionServices.API, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(section),
            });
            if (!result.ok) {
                const errorData = await result.json();
                throw new Error(errorData.message || 'Failed to create section');
            }
        } catch (error) {
            console.error(error);
        }
    }
    async updateSection(id: string, section: CreateSection): Promise<void> {
        try {
            const result = await fetch(SectionServices.API + `/${id}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(section),
            });
            if (!result.ok) {
                const errorData = await result.json();
                throw new Error(errorData.message || 'Failed to create section');
            }
        } catch (error) {
            console.error(error);
        }
    }
    async deleteSection(id: string) {
        try {
            const result = await fetch(SectionServices.API + `/${id}`, {
                method: "DELETE",
            });
            if (!result.ok) {
                const errorData = await result.json();
                throw new Error(errorData.message || 'Failed to create section');
            }
        } catch (error) {
            console.error(error);
        }
    }
}