import { Section } from "@/types/resume/Section";
import { CreateSection, GenerateSectionRequest } from ".";
import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import { SectionValidation } from "./SectionValidation";

export type AIGenerateResponse = { schema: Schema; content: Record<string, Content> | Content[]; explanation?: string };

export class SectionServices {
    private static readonly API = "/api/section";
    private static readonly GENERATE_API = "/api/resume/generate-section";
    private validation = new SectionValidation();

    async getSections(): Promise<Section[]> {
        const result = await fetch(SectionServices.API);
        return result.ok ? await result.json() as Section[] : [];
    }

    async getSectionById(id: string): Promise<Section | null> {
        const result = await fetch(`${SectionServices.API}/${id}`);
        return result.ok ? await result.json() as Section | null : null;
    }

    async createSection(section: CreateSection): Promise<Section> {
        const data = this.validation.validateSectionForm(section, { admin: section.visibility === "OFFICIAL" });
        const result = await fetch(SectionServices.API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!result.ok) throw new Error(await this.readError(result, "Failed to create section"));
        return await result.json() as Section;
    }

    async updateSection(id: string, section: CreateSection): Promise<Section> {
        const data = this.validation.validateSectionForm(section, { admin: section.visibility === "OFFICIAL" });
        const result = await fetch(`${SectionServices.API}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!result.ok) throw new Error(await this.readError(result, "Failed to update section"));
        return await result.json() as Section;
    }

    async deleteSection(id: string): Promise<void> {
        const result = await fetch(`${SectionServices.API}/${id}`, { method: "DELETE" });
        if (!result.ok) throw new Error(await this.readError(result, "Failed to delete section"));
    }

    async generateSection(request: GenerateSectionRequest): Promise<AIGenerateResponse> {
        const description = this.validation.validateGenerateDescription(request.description);
        const result = await fetch(SectionServices.GENERATE_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...request, description }) });
        if (!result.ok) throw new Error(await this.readError(result, "AI generation failed"));
        return await result.json() as AIGenerateResponse;
    }

    private async readError(response: Response, fallback: string): Promise<string> {
        const errorData = await response.json().catch(() => ({}));
        return errorData.message || errorData.error || fallback;
    }
}
