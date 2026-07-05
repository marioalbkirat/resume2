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

const decodePdfStringBytes = (value: string) => Buffer.from(value, "latin1");

const codePointToString = (hex: string) => {
    const bytes = Buffer.from(hex.length % 2 === 0 ? hex : `${hex}0`, "hex");
    if (bytes.length === 1) return String.fromCharCode(bytes[0]);
    if (bytes.length >= 2 && bytes.length % 2 === 0) {
        const utf16le = Buffer.from(bytes);
        for (let index = 0; index + 1 < utf16le.length; index += 2) [utf16le[index], utf16le[index + 1]] = [utf16le[index + 1], utf16le[index]];
        return utf16le.toString("utf16le");
    }
    return bytes.toString("utf8");
};

const parseCMap = (cmap: string) => {
    const map = new Map<string, string>();
    const sections = cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar|beginbfrange([\s\S]*?)endbfrange/g);
    for (const section of sections) {
        const bfchar = section[1];
        const bfrange = section[2];
        if (bfchar) {
            for (const line of bfchar.matchAll(/<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>/g)) map.set(line[1].toUpperCase(), codePointToString(line[2]));
        }
        if (bfrange) {
            for (const line of bfrange.matchAll(/<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>\s+(?:<([0-9a-fA-F]+)>|\[((?:\s*<[0-9a-fA-F]+>\s*)+)\])/g)) {
                const start = Number.parseInt(line[1], 16);
                const end = Number.parseInt(line[2], 16);
                const width = line[1].length;
                if (line[3]) {
                    const destination = Number.parseInt(line[3], 16);
                    for (let code = start; code <= end; code++) map.set(code.toString(16).toUpperCase().padStart(width, "0"), codePointToString((destination + code - start).toString(16)));
                } else if (line[4]) {
                    const destinations = [...line[4].matchAll(/<([0-9a-fA-F]+)>/g)].map(match => match[1]);
                    destinations.forEach((destination, index) => map.set((start + index).toString(16).toUpperCase().padStart(width, "0"), codePointToString(destination)));
                }
            }
        }
    }
    return map;
};

const decodeWithCMap = (raw: string, cmap?: Map<string, string>) => {
    if (!cmap?.size) return raw;
    const bytes = decodePdfStringBytes(raw);
    const keys = [...cmap.keys()];
    const codeByteLengths = [...new Set(keys.map(key => key.length / 2))].sort((a, b) => b - a);
    let decoded = "";
    for (let index = 0; index < bytes.length;) {
        const length = codeByteLengths.find(size => index + size <= bytes.length && cmap.has(bytes.subarray(index, index + size).toString("hex").toUpperCase()));
        if (length) {
            decoded += cmap.get(bytes.subarray(index, index + length).toString("hex").toUpperCase()) ?? "";
            index += length;
        } else {
            decoded += String.fromCharCode(bytes[index]);
            index += 1;
        }
    }
    return decoded;
};

const extractPdfStringToken = (token: string, cmap?: Map<string, string>) => {
    const raw = token.startsWith("(") ? decodePdfLiteral(token.slice(1, -1)) : decodePdfHex(token.slice(1, -1));
    return decodeWithCMap(raw, cmap);
};

const extractTextOperators = (stream: string, fontMaps: Map<string, Map<string, string>> = new Map()) => {
    const values: string[] = [];
    let currentFont: string | undefined;
    const operators = /\/([A-Za-z0-9_.-]+)\s+[\d.]+\s+Tf|(\((?:\\.|[^\\()])*\)|<[0-9a-fA-F\s]+>)\s*(?:Tj|'|")|\[((?:.|\n)*?)\]\s*TJ/g;
    for (const match of stream.matchAll(operators)) {
        if (match[1]) currentFont = match[1];
        else if (match[2]) values.push(extractPdfStringToken(match[2], currentFont ? fontMaps.get(currentFont) : undefined));
        else if (match[3]) {
            const parts = [...match[3].matchAll(/\((?:\\.|[^\\()])*\)|<[0-9a-fA-F\s]+>/g)].map(part => extractPdfStringToken(part[0], currentFont ? fontMaps.get(currentFont) : undefined));
            if (parts.length) values.push(parts.join(""));
        }
    }
    return values;
};

const collapseSpacedCharacters = (text: string) => text
    .replace(/(?<!\S)([\p{L}\p{N}](?: [\p{L}\p{N}]){2,})(?!\S)/gu, match => match.replace(/ /g, ""))
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .replace(/\s+([)\]}])/g, "$1");

const repairShiftedLatinText = (text: string) => text.replace(/[\u00a0-\u00ff]/g, character => {
    const shifted = character.charCodeAt(0) - 115;
    return shifted >= 32 && shifted <= 126 ? String.fromCharCode(shifted) : character;
});

const scoreExtractedText = (text: string) => {
    const asciiWords = text.match(/[A-Za-z]{3,}/g)?.length ?? 0;
    const resumeScore = getResumeSignals(text).positiveScore * 8;
    const highLatin = text.match(/[\u00c0-\u00ff]/g)?.length ?? 0;
    return asciiWords + resumeScore - highLatin;
};

const normalizeExtractedPdfText = (text: string) => {
    const normalized = collapseSpacedCharacters(text).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]+/g, " ").replace(/\s{2,}/g, " ").trim();
    const repaired = collapseSpacedCharacters(repairShiftedLatinText(text)).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]+/g, " ").replace(/\s{2,}/g, " ").trim();
    return scoreExtractedText(repaired) > scoreExtractedText(normalized) + 10 ? repaired : normalized;
};

const extractPdfText = (buffer: Buffer) => {
    const source = buffer.toString("latin1");
    const objects = new Map<string, string>();
    for (const object of source.matchAll(/(\d+)\s+\d+\s+obj([\s\S]*?)endobj/g)) objects.set(object[1], object[2]);
    const unicodeMaps = new Map<string, Map<string, string>>();
    for (const [id, object] of objects) {
        const streamMatch = object.match(/stream\r?\n([\s\S]*?)\r?\nendstream/);
        if (!streamMatch) continue;
        const streamBuffer = Buffer.from(streamMatch[1], "latin1");
        const candidates = object.includes("/FlateDecode") ? [() => inflateSync(streamBuffer).toString("latin1"), () => streamMatch[1]] : [() => streamMatch[1]];
        for (const read of candidates) {
            try {
                const cmap = parseCMap(read());
                if (cmap.size) unicodeMaps.set(id, cmap);
                break;
            } catch {
                continue;
            }
        }
    }
    const fontMaps = new Map<string, Map<string, string>>();
    for (const object of objects.values()) {
        const resources = object.match(/\/Font\s*<<([\s\S]*?)>>/);
        if (!resources) continue;
        for (const font of resources[1].matchAll(/\/([A-Za-z0-9_.-]+)\s+(\d+)\s+\d+\s+R/g)) {
            const fontObject = objects.get(font[2]);
            const toUnicode = fontObject?.match(/\/ToUnicode\s+(\d+)\s+\d+\s+R/);
            const cmap = toUnicode ? unicodeMaps.get(toUnicode[1]) : undefined;
            if (cmap) fontMaps.set(font[1], cmap);
        }
    }
    const streams = [...source.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)];
    const chunks: string[] = [];
    for (const match of streams) {
        const streamStart = match.index! + match[0].indexOf(match[1]);
        const streamBuffer = buffer.subarray(streamStart, streamStart + match[1].length);
        const objectPrefix = source.slice(Math.max(0, match.index! - 600), match.index!);
        const candidates = objectPrefix.includes("/FlateDecode") ? [() => inflateSync(streamBuffer).toString("latin1"), () => match[1]] : [() => match[1]];
        for (const read of candidates) {
            try {
                const text = extractTextOperators(read(), fontMaps).join(" ");
                if (text.trim()) chunks.push(text);
                break;
            } catch {
                continue;
            }
        }
    }
    return normalizeExtractedPdfText(chunks.join("\n"));
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

const getTextQuality = (text: string) => {
    const letters = [...text.matchAll(/[\p{L}]/gu)].length;
    const numbers = [...text.matchAll(/\p{N}/gu)].length;
    const whitespace = [...text.matchAll(/\s/gu)].length;
    const replacement = (text.match(/\uFFFD/g) ?? []).length;
    const controls = (text.match(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g) ?? []).length;
    const punctuation = [...text.matchAll(/[\p{P}]/gu)].length;
    const readable = letters + numbers + whitespace + punctuation;
    const total = Math.max(text.length, 1);
    return {
        readableRatio: readable / total,
        letterRatio: letters / total,
        replacementRatio: replacement / total,
        controlRatio: controls / total,
    };
};

const looksGarbled = (text: string) => {
    const { readableRatio, letterRatio, replacementRatio, controlRatio } = getTextQuality(text);
    return replacementRatio > 0.02 || controlRatio > 0.02 || readableRatio < 0.7 || letterRatio < 0.25;
};

const getResumeSignals = (text: string) => {
    const lower = text.toLowerCase();
    const positives = [
        "experience", "employment", "education", "skills", "email", "phone", "linkedin", "github", "portfolio", "summary", "profile", "work", "project", "certification", "resume", "cv",
        "الخبرة", "خبرة", "التعليم", "المؤهل", "المؤهلات", "المهارات", "مهارات", "البريد", "الإيميل", "الايميل", "الهاتف", "الجوال", "موبايل", "ملخص", "نبذة", "العمل", "عمل", "مشروع", "مشاريع", "الشهادات", "الدورات", "السيرة", "الذاتية",
    ];
    const negatives = ["chapter", "isbn", "publisher", "table of contents", "novel", "copyright", "appendix", "فصل", "الناشر", "حقوق الطبع", "الفهرس"];
    const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
    const phone = /(?:\+?\d[\d\s().-]{7,}\d)/.test(text);
    const url = /(?:https?:\/\/|www\.|linkedin\.com|github\.com)/i.test(text);
    const positiveScore = positives.filter(word => lower.includes(word)).length + Number(email) + Number(phone) + Number(url);
    const negativeScore = negatives.filter(word => lower.includes(word)).length;
    return { positiveScore, negativeScore, hasContactInfo: email || phone || url };
};

const looksObviouslyUnrelated = (text: string) => {
    const { positiveScore, negativeScore, hasContactInfo } = getResumeSignals(text);
    return negativeScore >= 2 && positiveScore < 2 && !hasContactInfo;
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
        if (looksGarbled(extractedText)) return NextResponse.json({ error: "The PDF text contains garbled, non-readable characters and does not resemble a structured resume; therefore it cannot be parsed into a valid resume." }, { status: 422 });
        if (looksObviouslyUnrelated(extractedText)) return NextResponse.json({ error: "This PDF does not look like a resume/CV. Please upload a relevant resume or CV, not a book or unrelated file." }, { status: 422 });
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
