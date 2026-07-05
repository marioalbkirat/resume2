import { Section } from "@/types/resume/Section";

export type CreateSection = Omit<Section, "id" | "authorId" | "createdAt" | "updatedAt">;
export type UpdateSection = Partial<CreateSection>;
export type GenerateSectionRequest = { description: string; sectionName: string; sectionType?: "resume" | "portfolio"; additionalRequirements?: string };
