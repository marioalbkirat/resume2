import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "cohere/north-mini-code:free";
const OPENROUTER_TIMEOUT_MS = 55_000;

export const maxDuration = 60;

const ALLOWED_TAGS = ["section", "div", "li", "ul", "img", "i", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"] as const;
const TAG_TYPES: Record<string, string> = {
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
const TAGS_WITHOUT_VALUE = new Set(["section", "div", "li", "ul"]);

interface GenerateSectionRequest {
    description?: string;
    sectionType?: "resume" | "portfolio";
    additionalRequirements?: string;
    sectionName?: string;
}

interface GeneratedPayload {
    schema?: Partial<Schema>;
    content?: Record<string, Content> | Content[];
    explanation?: string;
}


function inferSectionName(description: string, additionalRequirements?: string, sectionName?: string): string {
    if (sectionName?.trim()) return sectionName.trim();

    const exactNameMatch = additionalRequirements?.match(/exact section name:\s*([^\n.]+)/i);
    if (exactNameMatch?.[1]?.trim()) return exactNameMatch[1].trim();

    const firstSentence = description.split(/[.\n]/)[0]?.trim();
    if (!firstSentence) return "Generated Section";

    const cleaned = firstSentence
        .replace(/^(create|generate|build|make|add)\s+(a|an|the)?\s*/i, "")
        .replace(/\s+(section|fields?).*$/i, " section")
        .trim();

    return cleaned ? cleaned[0].toUpperCase() + cleaned.slice(1) : "Generated Section";
}

function extractFieldNames(description: string): string[] {
    const candidates = description
        .replace(/\b(each|with|and|containing|include|including|entries?|section|professional|create|generate|build|make|for|resume|portfolio)\b/gi, ",")
        .split(/[,;\n]+/)
        .map((field) => field.trim().replace(/^\d+\s*/, "").replace(/[^a-z0-9 /_-]/gi, "").trim())
        .filter((field) => field.length >= 3 && field.length <= 40);

    const unique = Array.from(new Set(candidates));
    return unique.length ? unique.slice(0, 8) : ["Title", "Summary", "Highlights"];
}

function toFieldName(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
}

function buildFallbackPayload(description: string, additionalRequirements?: string, sectionName?: string): GeneratedPayload {
    const title = inferSectionName(description, additionalRequirements, sectionName);
    const fields = extractFieldNames(description);
    const content: Record<string, Content> = {};

    const children = fields.map((field) => {
        const id = crypto.randomUUID();
        const name = toFieldName(field);
        content[id] = {
            id,
            type: "text",
            value: field,
        };

        return {
            id,
            name,
            tag: "span",
            type: "text",
            children: [],
        };
    });

    return {
        schema: {
            id: crypto.randomUUID(),
            name: title,
            tag: "section",
            type: "section",
            children,
        },
        content,
        explanation: "Created a section from your description because the AI provider returned an empty completion.",
    };
}

function getAllowedChildren(tag: string): string[] {
    if (["img", "i", "span", "text", "a", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return [];
    if (tag === "ul") return ["li"];
    if (tag === "li") return ["div", "ul", "img", "i", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
    if (tag === "p") return ["span", "img", "i", "a"];
    return ["div", "ul", "img", "i", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
}


function getProviderErrorMessage(result: unknown): string | undefined {
    if (!result || typeof result !== "object") return undefined;

    const error = (result as { error?: unknown }).error;
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) return message;
    }

    const choice = (result as { choices?: Array<{ finish_reason?: unknown; native_finish_reason?: unknown }> }).choices?.[0];
    const finishReason = choice?.finish_reason ?? choice?.native_finish_reason;
    return typeof finishReason === "string" && finishReason !== "stop" ? `Provider finished without content (${finishReason}).` : undefined;
}

function extractMessageContent(result: unknown): string | undefined {
    const content = (result as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;

    if (typeof content === "string" && content.trim()) return content;

    if (Array.isArray(content)) {
        const text = content
            .map((part) => {
                if (typeof part === "string") return part;
                if (part && typeof part === "object") {
                    const text = (part as { text?: unknown; content?: unknown }).text ?? (part as { text?: unknown; content?: unknown }).content;
                    return typeof text === "string" ? text : "";
                }
                return "";
            })
            .join("\n")
            .trim();
        if (text) return text;
    }

    return undefined;
}

function extractJson(text: string): GeneratedPayload {
    const cleanText = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();

    try {
        return JSON.parse(cleanText) as GeneratedPayload;
    } catch {
        const firstBrace = cleanText.indexOf("{");
        const lastBrace = cleanText.lastIndexOf("}");
        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            throw new Error("AI response did not include valid JSON.");
        }
        return JSON.parse(cleanText.slice(firstBrace, lastBrace + 1)) as GeneratedPayload;
    }
}

function normalizeSchema(node: Partial<Schema> | undefined, parentId?: string, fallbackName = "Generated Section"): Schema {
    const requestedTag = typeof node?.tag === "string" ? node.tag : "div";
    const tag = ALLOWED_TAGS.includes(requestedTag as (typeof ALLOWED_TAGS)[number]) ? requestedTag : "div";
    const id = typeof node?.id === "string" && node.id.trim() ? node.id.trim() : crypto.randomUUID();
    const allowedChildren = getAllowedChildren(tag);

    return {
        id,
        name: typeof node?.name === "string" && node.name.trim() ? node.name.trim() : fallbackName,
        tag,
        type: TAG_TYPES[tag] || tag,
        role: tag === "i" && node?.role === "sectionIcon" ? "sectionIcon" : tag === "i" ? "default" : undefined,
        parentId,
        children: Array.isArray(node?.children)
            ? node.children
                .filter((child) => allowedChildren.includes(typeof child?.tag === "string" ? child.tag : ""))
                .map((child) => normalizeSchema(child, id, "Generated Field"))
            : [],
    };
}

function flattenSchema(schema: Schema): Schema[] {
    return [schema, ...schema.children.flatMap(flattenSchema)];
}

function normalizeKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function hasRenderableChildren(schema: Schema): boolean {
    return flattenSchema(schema).some((node) => !TAGS_WITHOUT_VALUE.has(node.tag));
}

function contentEntries(generatedContent: GeneratedPayload["content"]): Array<[string, Content]> {
    if (Array.isArray(generatedContent)) {
        return generatedContent.map((item) => [typeof item.id === "string" ? item.id : crypto.randomUUID(), item]);
    }

    return Object.entries(generatedContent ?? {});
}

function buildSchemaFromContent(sectionName: string, generatedContent: GeneratedPayload["content"]): Partial<Schema> {
    const entries = contentEntries(generatedContent);
    const title = sectionName.trim() || "Generated Section";

    return {
        id: crypto.randomUUID(),
        name: title,
        tag: "section",
        type: "section",
        children: [
            {
                id: crypto.randomUUID(),
                name: title,
                tag: "h2",
                type: "heading",
                children: [],
            },
            {
                id: crypto.randomUUID(),
                name: "list",
                tag: "ul",
                type: "list",
                children: entries.map(([key, item]) => ({
                    id: crypto.randomUUID(),
                    name: "list_item",
                    tag: "li",
                    type: "listItem",
                    children: [
                        {
                            id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : crypto.randomUUID(),
                            name: key,
                            tag: item.type === "heading" ? "h3" : item.type === "icon" ? "i" : item.type === "link" ? "a" : item.type === "image" ? "img" : "span",
                            type: item.type || "text",
                            children: [],
                        },
                    ],
                })),
            },
        ],
    };
}

function normalizeContent(schema: Schema, generatedContent: GeneratedPayload["content"]): Record<string, Content> {
    const inputContent = Object.fromEntries(contentEntries(generatedContent));
    const normalizedInput = Object.entries(inputContent).map(([key, item]) => ({
        key: normalizeKey(key),
        id: normalizeKey(typeof item?.id === "string" ? item.id : ""),
        propName: normalizeKey(typeof item?.prop?.name === "string" ? item.prop.name : ""),
        item,
    }));

    return Object.fromEntries(
        flattenSchema(schema)
            .filter((node) => !TAGS_WITHOUT_VALUE.has(node.tag))
            .map((node) => {
                const nodeKeys = [node.id, node.name, node.tag, node.type].filter(Boolean).map(normalizeKey);
                const original = normalizedInput.find((entry) =>
                    nodeKeys.includes(entry.key) || nodeKeys.includes(entry.id) || nodeKeys.includes(entry.propName)
                )?.item;
                const content: Content = {
                    id: node.id,
                    type: node.type,
                    prop: original?.prop ?? (node.tag === "a" ? { href: "#" } : node.tag === "img" ? { src: "", alt: node.name } : undefined),
                    value: typeof original?.value === "string" ? original.value : "",
                };
                return [node.id, content];
            })
    );
}

export async function POST(request: NextRequest) {
    try {
        const { description, sectionType = "resume", additionalRequirements, sectionName }: GenerateSectionRequest = await request.json();

        if (!description?.trim()) {
            return NextResponse.json({ error: "description is required." }, { status: 400 });
        }

        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "generate resume section",
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: MODEL,
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You generate custom resume-builder sections.
Return ONLY valid JSON with this exact shape:
{
  "schema": {
    "id": "uuid",
    "name": "section title",
    "tag": "section",
    "type": "section",
    "children": [
      {
        "id": "uuid",
        "name": "field_name",
        "tag": "span",
        "type": "text",
        "children": []
      }
    ]
  },
  "content": {
    "same-schema-node-uuid": { "id": "same-schema-node-uuid", "type": "text|heading|link|image|icon", "value": "field text", "prop": { "href": "optional link", "src": "optional image src", "alt": "optional image alt" } }
  },
  "explanation": "short explanation"
}
Schema rules:
- Root schema must be tag/type section.
- Allowed tags: ${ALLOWED_TAGS.join(", ")}.
- Use type mapping: ${JSON.stringify(TAG_TYPES)}.
- Every schema node needs name, tag, type, and children array.
- Do not put content values on section, div, ul, or li nodes.
- Put text values in content entries for p, span, headings, a, i, and img nodes.
- For icons, value must be a react-icons/fa name such as FaBriefcase, FaGraduationCap, FaCode, or FaAward.
- Generate UUID ids for EVERY schema node.
- Content MUST be an object keyed by the exact schema node id it belongs to.
- Every content value MUST include type and value; include prop only for links/images when needed.
- Do not invent content keys that are not schema ids (for example, do not use job1_company unless a schema node has id job1_company).
- The schema children array must contain all visible fields; never return an empty children array for a non-empty section.
- No markdown fences and no text outside JSON.`.trim(),
                    },
                    {
                        role: "user",
                        content: `TARGET: ${sectionType.toUpperCase()}\nDESCRIPTION:\n${description.trim()}\n\nADDITIONAL REQUIREMENTS:\n${additionalRequirements || "None"}`,
                    },
                ],
                max_tokens: 5000,
            }),
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: "AI generation failed.", details: errorText }, { status: response.status });
        }

        const result = await response.json();
        const aiContent = extractMessageContent(result);
        if (!aiContent) {
            const details = getProviderErrorMessage(result) || "The AI provider returned an empty response.";
            const fallback = buildFallbackPayload(description, additionalRequirements, sectionName);
            const fallbackSchema = normalizeSchema({ ...fallback.schema, tag: "section", type: "section" }, undefined, fallback.schema?.name || "Generated Section");
            return NextResponse.json({
                schema: fallbackSchema,
                content: normalizeContent(fallbackSchema, fallback.content),
                explanation: `${fallback.explanation} Provider detail: ${details}`,
                warning: "AI_PROVIDER_EMPTY_RESPONSE",
            }, { status: 200 });
        }

        const generated = extractJson(aiContent);
        const requestedSchema = { ...generated.schema, tag: "section", type: "section" };
        const initialSchema = normalizeSchema(requestedSchema, undefined, generated.schema?.name || "Generated Section");
        const schema = hasRenderableChildren(initialSchema)
            ? initialSchema
            : normalizeSchema(buildSchemaFromContent(generated.schema?.name || "Generated Section", generated.content), undefined, generated.schema?.name || "Generated Section");
        const content = normalizeContent(schema, generated.content);

        return NextResponse.json({ schema, content, explanation: generated.explanation }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error && error.name === "AbortError"
            ? "AI provider request timed out. Try again or configure OPENROUTER_MODEL with a faster model."
            : error instanceof Error ? error.message : "AI generation failed.";
        const status = error instanceof Error && error.name === "AbortError" ? 504 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
