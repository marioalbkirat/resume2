import { Distribution } from "@/types/resume/Distribution";
import { ResumeStyle } from "@/types/resume/ResumeStyle";
import { Schema, Section } from "@/types/resume/Section";
import { Settings } from "@/types/resume/Settings";

export const defaultResumeSettings: Settings = { fileName: "My_Resume", direction: "LTR", pageSize: "A4", showIcons: true, columns: "TWO", sidebar: { position: "LEFT" } };
export const defaultResumeStyle: ResumeStyle = { global: { fontFamily: "Arial", fontSize: "14px", lineHeight: 1.5, color: "#111827", backgroundColor: "#ffffff", padding: "40px", margin: "0 auto" }, selectors: {}, elements: {}, customCSS: "" };

export const toResumeSections = (schema: unknown): Section[] => {
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) return [];
    return Object.entries(schema as Record<string, Schema>).map(([id, sectionSchema], index) => ({
        id,
        name: `Section ${index + 1}`,
        target: "RESUME",
        visibility: "PRIVATE",
        authorId: "",
        schema: sectionSchema,
        content: {},
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Section));
};

export const normalizeResumeSettings = (settings: unknown): Settings => {
    const partial = (settings ?? {}) as Partial<Settings>;
    return {
        ...defaultResumeSettings,
        ...partial,
        sidebar: { position: partial.sidebar?.position ?? "LEFT" },
    };
};

export const normalizeResumeDistribution = (distribution: unknown): Distribution => (distribution ?? {}) as Distribution;
export const normalizeResumeStyle = (style: unknown): ResumeStyle => ({ ...defaultResumeStyle, ...((style ?? {}) as Partial<ResumeStyle>) });
