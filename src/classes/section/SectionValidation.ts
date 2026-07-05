import { z, ZodError } from "zod";
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

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof ZodError) return error.issues.map(issue => issue.message).join(" ") || fallback;
    return error instanceof Error ? error.message : fallback;
  }

  validateGenerateDescription(description: unknown): string {
    try {
      return this.descriptionSchema.parse(description);
    } catch (error) {
      throw new Error(this.formatError(error, "Description must be 10 to 200 characters."));
    }
  }

  validateContentValue(tag: string, value: unknown): string {
    try {
      return this.getContentValueSchema(tag).parse(value ?? "");
    } catch (error) {
      throw new Error(this.formatError(error, `Invalid ${tag} content value.`));
    }
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
    try {
      return this.fieldTitleSchema.parse(title);
    } catch (error) {
      throw new Error(this.formatError(error, "Field title must be 4 to 30 characters."));
    }
  }

  safeValidateFieldTitle(title: unknown, fallback = "Field title"): string {
    const titleResult = this.fieldTitleSchema.safeParse(title);
    if (titleResult.success) return titleResult.data;

    const fallbackResult = this.fieldTitleSchema.safeParse(fallback);
    return fallbackResult.success ? fallbackResult.data : "Field title";
  }

  validateSectionForm(input: Partial<SectionForm>, options: { admin?: boolean } = {}): SectionForm {
    try {
      const form = z.object({
        name: this.sectionNameSchema,
        target: z.enum(["RESUME", "PORTFOLIO"]),
        visibility: z.enum(["OFFICIAL", "COMMUNITY", "PRIVATE"]),
        schema: z.any(),
        content: z.record(z.string(), z.any()).default({}),
      }).parse(input);
      if (form.visibility === "OFFICIAL" && !options.admin) throw new Error("Only admins can create official sections.");
      const schema = this.sanitizeSchema(form.schema);
      return { ...form, schema, content: this.sanitizeContent(schema, form.content) };
    } catch (error) {
      throw new Error(this.formatError(error, "Section validation failed."));
    }
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
          if (!["img", "i"].includes(node.tag) && prop.title) prop.title = this.validateFieldTitle(prop.title);
          if (node.tag === "a") prop.href = prop.href || "https://example.com";
          if (node.tag === "img") {
            prop.src = prop.src || item.value || "/images/user-photo.avif";
            prop.alt = prop.alt || "Image";
          }
          output[node.id] = { id: node.id, type: node.type, value: this.validateContentValue(node.tag, item.value), prop };
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
