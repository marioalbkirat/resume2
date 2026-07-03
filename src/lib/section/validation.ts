import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";

export type SectionForm = {
  name: string;
  target: "RESUME" | "PORTFOLIO";
  visibility: "OFFICIAL" | "COMMUNITY" | "PRIVATE";
  schema: Schema;
  content: Record<string, Content>;
};

const targets = ["RESUME", "PORTFOLIO"];
const visibilities = ["OFFICIAL", "COMMUNITY", "PRIVATE"];

export function validateSectionForm(input: Partial<SectionForm>, options: { admin?: boolean } = {}): { data?: SectionForm; error?: string } {
  const name = input.name?.trim();
  if (!name) return { error: "Section name is required." };
  if (!input.schema || typeof input.schema !== "object") return { error: "Section schema is required." };
  if (!targets.includes(input.target ?? "")) return { error: "Invalid section target." };
  if (!visibilities.includes(input.visibility ?? "")) return { error: "Invalid section visibility." };
  if (input.visibility === "OFFICIAL" && !options.admin) return { error: "Only admins can create official sections." };
  return { data: { name, target: input.target!, visibility: input.visibility!, schema: { ...input.schema, name }, content: input.content ?? {} } };
}
