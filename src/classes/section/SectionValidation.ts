import { z } from "zod";
import { Content } from "@/types/resume/Content";
import { Schema, SectionRole } from "@/types/resume/Section";
import { SectionSchema } from "./SectionSchema";

export type SectionForm = {
  name: string;
  target: "RESUME" | "PORTFOLIO";
  visibility: "OFFICIAL" | "COMMUNITY" | "PRIVATE";
  schema: Schema;
  content: Record<string, Content>;
};

export class SectionValidation {
  private schemaControl = new SectionSchema();
  private sectionNameSchema = z.string().trim().min(4).max(30);
  private fieldTitleSchema = z.string().trim().min(4).max(30);
  private descriptionSchema = z.string().trim().min(10).max(200);

  validateGenerateDescription(description: unknown): string {
    return this.descriptionSchema.parse(description);
  }

  validateContentValue(tag: string, value: unknown): string {
    return this.getContentValueSchema(tag).parse(value ?? "");
  }

  safeValidateContentValue(tag: string, value: unknown, fallback = ""): string {
    const schema = this.getContentValueSchema(tag);
    const valueResult = schema.safeParse(value ?? "");
    if (valueResult.success) return valueResult.data;

    const fallbackResult = schema.safeParse(fallback);
    if (fallbackResult.success) return fallbackResult.data;

    return this.getFallbackContentValue(tag);
  }

  validateFieldTitle(title: unknown): string {
    return this.fieldTitleSchema.parse(title);
  }

  safeValidateFieldTitle(title: unknown, fallback = "Field title"): string {
    const titleResult = this.fieldTitleSchema.safeParse(title);
    if (titleResult.success) return titleResult.data;

    const fallbackResult = this.fieldTitleSchema.safeParse(fallback);
    return fallbackResult.success ? fallbackResult.data : "Field title";
  }

  validateSectionForm(input: Partial<SectionForm>, options: { admin?: boolean } = {}): SectionForm {
    const form = z.object({
      name: this.sectionNameSchema,
      target: z.enum(["RESUME", "PORTFOLIO"]),
      visibility: z.enum(["OFFICIAL", "COMMUNITY", "PRIVATE"]),
      schema: z.any(),
      content: z.record(z.string(), z.any()).default({}),
    }).parse(input);
    if (form.visibility === "OFFICIAL" && !options.admin) throw new Error("Only admins can create official sections.");
    return { ...form, schema: this.sanitizeSchema(form.schema), content: this.sanitizeContent(form.schema, form.content) };
  }

  private sanitizeSchema(input: Schema, parentId?: string): Schema {
    if (!input?.id || !this.schemaControl.tags.includes(input.tag)) throw new Error("Invalid section schema.");
    const allowed = this.schemaControl.allowedTagChildren(input.tag);
    const children = allowed.length ? (input.children ?? []).filter(child => allowed.includes(child.tag)).map(child => this.sanitizeSchema(child, input.id)) : [];
    const role = input.tag === "i" ? this.normalizeRole(input.role) : undefined;
    return { id: input.id, tag: input.tag, type: this.schemaControl.getAlias()[input.tag] || input.type, role, parentId, children };
  }

  private sanitizeContent(schema: Schema, content: Record<string, Content>): Record<string, Content> {
    const output: Record<string, Content> = {};
    const visit = (node: Schema) => {
      if (!this.schemaControl.getTagsWithoutValue().includes(node.tag)) {
        const item = content[node.id];
        if (item) {
          const prop = { ...(item.prop ?? {}) };
          if (!["img", "i"].includes(node.tag) && prop.title) prop.title = this.safeValidateFieldTitle(prop.title);
          if (node.tag === "a") prop.href = prop.href || "https://example.com";
          if (node.tag === "img") {
            prop.src = prop.src || item.value || "/images/user-photo.avif";
            prop.alt = prop.alt || "Image";
          }
          output[node.id] = { id: node.id, type: node.type, value: this.safeValidateContentValue(node.tag, item.value), prop };
        }
      }
      node.children.forEach(visit);
    };
    visit(schema);
    return output;
  }

  private getContentValueSchema(tag: string) {
    const base = z.string().trim();
    if (tag === "span") return base.min(3).max(50);
    if (tag === "p") return base.min(5).max(250);
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return base.min(4).max(100);
    return base;
  }

  private getFallbackContentValue(tag: string): string {
    if (tag === "span") return "Text";
    if (tag === "p") return "Paragraph content";
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return "Heading Text";
    return "";
  }

  private normalizeRole(role?: SectionRole): SectionRole | undefined {
    if (role === "sectionTitleIcon" || role === "sectionIcon") return "sectionTitleIcon";
    return "regularIcon";
  }
}
