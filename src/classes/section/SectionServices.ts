import { Section } from "@/types/resume/Section";
import { CreateSection } from ".";

const fallbackSection = (): Section => ({
  id: crypto.randomUUID(),
  name: "Untitled",
  target: "RESUME",
  visibility: "PRIVATE",
  authorId: "",
  schema: { id: crypto.randomUUID(), tag: "section", type: "section", name: "Untitled", selectorGroup: "section", children: [] },
  content: {},
  createdAt: new Date(),
  updatedAt: new Date(),
});

export class SectionServices {
    private static readonly ADMIN_API = "/api/admin/sections";
    private static readonly USER_API = "/api/section";

    async getSections(): Promise<Section[]> {
        try {
            const result = await fetch(SectionServices.ADMIN_API);
            return result.ok ? await result.json() as Section[] : [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    async getSectionById(id: string): Promise<Section> {
        try {
            const result = await fetch(`${SectionServices.ADMIN_API}/${id}`);
            return result.ok ? await result.json() as Section : fallbackSection();
        } catch (error) {
            console.error(error);
            return fallbackSection();
        }
    }
    async createSection(section: CreateSection): Promise<Section> {
        const api = section.visibility === "OFFICIAL" ? SectionServices.ADMIN_API : SectionServices.USER_API;
        const result = await fetch(api, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(section) });
        if (!result.ok) {
            const errorData = await result.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to create section');
        }
        return await result.json() as Section;
    }
    async updateSection(id: string, section: CreateSection): Promise<Section> {
        const api = section.visibility === "OFFICIAL" ? SectionServices.ADMIN_API : SectionServices.USER_API;
        const result = await fetch(`${api}/${id}`, { method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(section) });
        if (!result.ok) {
            const errorData = await result.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to update section');
        }
        return await result.json() as Section;
    }
    async deleteSection(id: string) {
        const result = await fetch(`${SectionServices.ADMIN_API}/${id}`, { method: "DELETE" });
        if (!result.ok) {
            const errorData = await result.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to delete section');
        }
    }
}
