import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "cohere/north-mini-code:free";

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
}

interface GeneratedPayload {
    schema?: Partial<Schema>;
    content?: Record<string, Content> | Content[];
    explanation?: string;
}

function getAllowedChildren(tag: string): string[] {
    if (tag === "img" || tag === "i") return [];
    if (tag === "ul") return ["li"];
    if (tag === "li") return ["div", "ul", "img", "i", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
    if (tag === "p") return ["span", "img", "i", "a"];
    if (tag === "span") return ["span", "img", "i", "a"];
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return ["span", "img", "i", "a"];
    if (tag === "a") return ["span", "img", "i"];
    return ["div", "ul", "img", "i", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"];
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
    const id = crypto.randomUUID();
    const allowedChildren = getAllowedChildren(tag);

    return {
        id,
        name: typeof node?.name === "string" && node.name.trim() ? node.name.trim() : fallbackName,
        tag,
        type: TAG_TYPES[tag] || tag,
        role: tag === "i" && node?.role === "sectionIcon" ? "sectionIcon" : tag === "i" ? "default" : undefined,
        selectorGroup: typeof node?.selectorGroup === "string" && node.selectorGroup.trim() ? node.selectorGroup.trim() : tag,
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

function normalizeContent(schema: Schema, generatedContent: GeneratedPayload["content"]): Record<string, Content> {
    const inputContent = Array.isArray(generatedContent)
        ? Object.fromEntries(generatedContent.map((item) => [item.id, item]))
        : generatedContent ?? {};
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
                const nodeKeys = [node.id, node.name, node.selectorGroup].filter(Boolean).map(normalizeKey);
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
        const { description, sectionType = "resume", additionalRequirements }: GenerateSectionRequest = await request.json();

        if (!description?.trim()) {
            return NextResponse.json({ error: "description is required." }, { status: 400 });
        }

        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
        }

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "generate resume section",
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: `You generate custom resume-builder sections.
Return ONLY valid JSON with this exact shape:
{
  "schema": {
    "name": "section title",
    "tag": "section",
    "type": "section",
    "selectorGroup": "section",
    "children": []
  },
  "content": {
    "field name or stable key": { "id": "same field name or stable key", "type": "text|heading|link|image|icon", "value": "field text", "prop": { "href": "optional link", "src": "optional image src", "alt": "optional image alt" } }
  },
  "explanation": "short explanation"
}
Schema rules:
- Root schema must be tag/type/selectorGroup section.
- Allowed tags: ${ALLOWED_TAGS.join(", ")}.
- Use type mapping: ${JSON.stringify(TAG_TYPES)}.
- Every schema node needs name, tag, type, selectorGroup, and children array.
- Do not put content values on section, div, ul, or li nodes.
- Put text values in content entries for p, span, headings, a, i, and img nodes.
- For icons, value must be a react-icons/fa name such as FaBriefcase, FaGraduationCap, FaCode, or FaAward.
- Content keys can be stable temporary names; the server will replace ids with generated UUIDs.
- No markdown fences and no text outside JSON.`.trim(),
                    },
                    {
                        role: "user",
                        content: `TARGET: ${sectionType.toUpperCase()}\nDESCRIPTION:\n${description.trim()}\n\nADDITIONAL REQUIREMENTS:\n${additionalRequirements || "None"}`,
                    },
                ],
                max_tokens: 5000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: "AI generation failed.", details: errorText }, { status: response.status });
        }

        const result = await response.json();
        const aiContent = result?.choices?.[0]?.message?.content;
        if (typeof aiContent !== "string") {
            return NextResponse.json({ error: "AI response is missing message content." }, { status: 502 });
        }

        const generated = extractJson(aiContent);
        const schema = normalizeSchema({ ...generated.schema, tag: "section", type: "section", selectorGroup: "section" }, undefined, generated.schema?.name || "Generated Section");
        const content = normalizeContent(schema, generated.content);

        return NextResponse.json({ schema, content, explanation: generated.explanation }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "AI generation failed." }, { status: 400 });
    }
}
