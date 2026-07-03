import { Section } from "@/types/resume/Section";

export type CreateSection = Omit<Section, "id" | "authorId" | "createdAt" | "updatedAt">;
