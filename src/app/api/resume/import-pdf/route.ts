import { Content } from "@/types/resume/Content";
import { Schema } from "@/types/resume/Section";
import { NextRequest, NextResponse } from "next/server";
import { inflateSync } from "zlib";

const MAX_PDF_SIZE = 2 * 1024 * 1024;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "cohere/north-mini-code:free";

type ImportRequest = { fileName?: string; fileBase64?: string; schema?: Record<string, Schema>; content?: Record<string, Content>; };

type Field = { id: string; label: string; tag: string; type: string; section: string; existingValue?: string; };

const isContentNode = (node: Schema) => !["section", "div", "ul", "ol", "li"].includes(node.tag) && !["section", "container", "list", "listItem"].includes(node.type);

const decodePdfLiteral = (value: string) => value.replace(/\\([nrtbf()\\])/g, (_, code: string) => ({ n: "\n", r: "\n", t: " ", b: " ", f: " ", "(": "(", ")": ")", "\\": "\\" }[code] ?? code))
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) => String.fromCharCode(Number.parseInt(octal, 8)))
    .replace(/\\(?:\r?\n|\r)/g, "");

const decodePdfHex = (value: string) => {
    const normalized = value.replace(/\s+/g, "");
    const evenHex = normalized.length % 2 === 0 ? normalized : `${normalized}0`;
    const bytes = Buffer.from(evenHex, "hex");
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
        const utf16le = Buffer.from(bytes.subarray(2));
        for (let index = 0; index + 1 < utf16le.length; index += 2) [utf16le[index], utf16le[index + 1]] = [utf16le[index + 1], utf16le[index]];
        return utf16le.toString("utf16le");
    }
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return bytes.subarray(2).toString("utf16le");
    return bytes.toString("latin1");
};

const extractPdfStrings = (input: string) => {
    const values: string[] = [];
    const tokens = /\((?:\\.|[^\\()])*\)|<([0-9a-fA-F\s]+)>/g;
    for (const match of input.matchAll(tokens)) {
        if (match[0].startsWith("(")) values.push(decodePdfLiteral(match[0].slice(1, -1)));
        else if (match[1]) values.push(decodePdfHex(match[1]));
    }
    return values;
};

const extractTextOperators = (stream: string) => {
    const values: string[] = [];
    const singleText = /(\((?:\\.|[^\\()])*\)|<[0-9a-fA-F\s]+>)\s*(?:Tj|'|")/g;
    for (const match of stream.matchAll(singleText)) values.push(...extractPdfStrings(match[1]));
    const arrays = /\[((?:.|\n)*?)\]\s*TJ/g;
    for (const match of stream.matchAll(arrays)) {
        const parts = extractPdfStrings(match[1]);
        if (parts.length) values.push(parts.join(""));
    }
    return values;
};

const extractPdfText = (buffer: Buffer) => {
    const source = buffer.toString("latin1");
    const streams = [...source.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)];
    const chunks: string[] = [];
    for (const match of streams) {
        const streamStart = match.index! + match[0].indexOf(match[1]);
        const streamBuffer = buffer.subarray(streamStart, streamStart + match[1].length);
        const objectPrefix = source.slice(Math.max(0, match.index! - 600), match.index!);
        const candidates = objectPrefix.includes("/FlateDecode") ? [() => inflateSync(streamBuffer).toString("latin1"), () => match[1]] : [() => match[1]];
        for (const read of candidates) {
            try {
                const text = extractTextOperators(read()).join(" ");
                if (text.trim()) chunks.push(text);
                break;
            } catch {
                continue;
            }
        }
    }
    return chunks.join("\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]+/g, " ").replace(/\s{2,}/g, " ").trim();
};

const collectFields = (schema: Record<string, Schema>, content: Record<string, Content> = {}) => {
    const fields: Field[] = [];
    const walk = (node: Schema, section: string) => {
        if (isContentNode(node)) fields.push({ id: node.id, label: node.name || node.id, tag: node.tag, type: node.type, section, existingValue: content[node.id]?.value });
        (node.children ?? []).forEach(child => walk(child, section));
    };
    Object.values(schema ?? {}).forEach(section => walk(section, section.name));
    return fields;
};

const parseJson = (value: string) => JSON.parse(value.replace(/```json|```/g, "").trim());

const heuristicResumeScore = (text: string) => {
    const lower = text.toLowerCase();
    const positives = ["experience", "education", "skills", "email", "phone", "linkedin", "summary", "work", "project", "certification", "resume", "cv", "الخبرة", "التعليم", "المهارات", "البريد", "الهاتف", "الجوال", "ملخص", "العمل", "مشروع", "الشهادات", "السيرة"];
    const negatives = ["chapter", "isbn", "publisher", "table of contents", "novel", "copyright", "appendix"];
    return positives.filter(word => lower.includes(word)).length - negatives.filter(word => lower.includes(word)).length * 2;
};

const fallbackContent = (fields: Field[], text: string, previous: Record<string, Content> = {}) => {
    const lines = text.split(/(?<=\.)\s+|\n+/).map(line => line.trim()).filter(Boolean);
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
    const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() ?? "";
    const next: Record<string, Content> = {};
    fields.forEach((field, index) => {
        const label = field.label.toLowerCase();
        let value = previous[field.id]?.value || field.existingValue || "";
        if (label.includes("email")) value = email || value;
        else if (label.includes("phone") || label.includes("mobile")) value = phone || value;
        else if (label.includes("name") || label.includes("title")) value = lines[0] || value;
        else if (label.includes("summary") || label.includes("profile")) value = lines.slice(0, 3).join(" ").slice(0, 420) || value;
        else value = lines[index % Math.max(lines.length, 1)] || value;
        next[field.id] = { id: field.id, type: previous[field.id]?.type ?? field.type ?? "text", value, prop: previous[field.id]?.prop };
    });
    return next;
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as ImportRequest;
        if (!body.fileBase64 || !body.fileName?.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "Please upload a PDF resume/CV file." }, { status: 400 });
        const buffer = Buffer.from(body.fileBase64, "base64");
        if (buffer.length > MAX_PDF_SIZE) return NextResponse.json({ error: "PDF is too large. Maximum size is 2MB." }, { status: 413 });
        if (buffer.subarray(0, 4).toString() !== "%PDF") return NextResponse.json({ error: "Invalid PDF file." }, { status: 400 });
        const extractedText = extractPdfText(buffer);
        if (extractedText.length < 80) return NextResponse.json({ error: "Could not extract enough readable resume text from this PDF." }, { status: 422 });
        if (heuristicResumeScore(extractedText) < 2) return NextResponse.json({ error: "This PDF does not look like a resume/CV. Please upload a relevant resume or CV, not a book or unrelated file." }, { status: 422 });
        const fields = collectFields(body.schema ?? {}, body.content ?? {});
        if (!fields.length) return NextResponse.json({ error: "No editable resume fields are available to fill." }, { status: 400 });

        if (OPENROUTER_API_KEY) {
            const response = await fetch(OPENROUTER_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_API_KEY}`, "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", "X-Title": "import resume pdf" },
                body: JSON.stringify({
                    model: MODEL,
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: "You validate and import resume/CV PDF text into an existing resume builder. Return ONLY JSON: {\"isResume\":boolean,\"reason\":string,\"content\":{\"fieldId\":{\"id\":\"fieldId\",\"type\":\"text\",\"value\":\"clean value\",\"prop\":{}}}}. Reject books and unrelated files. Use only provided field ids. Keep values concise, professional, and faithful to the PDF." },
                        { role: "user", content: `FIELDS:\n${JSON.stringify(fields)}\n\nPDF_TEXT:\n${extractedText.slice(0, 12000)}` },
                    ],
                    max_tokens: 5000,
                }),
            });
            if (response.ok) {
                const result = await response.json();
                const message = result?.choices?.[0]?.message?.content;
                if (typeof message === "string") {
                    const parsed = parseJson(message) as { isResume?: boolean; reason?: string; content?: Record<string, Content>; };
                    if (parsed.isResume === false) return NextResponse.json({ error: parsed.reason || "This PDF does not look like a resume/CV." }, { status: 422 });
                    if (parsed.content && Object.keys(parsed.content).length) return NextResponse.json({ content: parsed.content, extractedText: extractedText.slice(0, 2000) });
                }
            }
        }

        return NextResponse.json({ content: fallbackContent(fields, extractedText, body.content), extractedText: extractedText.slice(0, 2000) });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to import PDF." }, { status: 400 });
    }
}
