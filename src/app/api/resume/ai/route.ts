import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "cohere/north-mini-code:free";

type AITool =
    | "analyze"
    | "match-score"
    | "keywords"
    | "coverletter"
    | "summary"
    | "translation"
    | "design-resume"
    | "optimize"
    | "rewrite"
    | "skills"
    | "ats-optimize"
    | "targeted-resume";

const jsonInstruction = "Return ONLY one valid JSON object. Do not include markdown, code fences, comments, trailing commas, or commentary outside JSON. Escape every double quote inside string values.";

const prompts: Record<AITool, string> = {
    analyze: `${jsonInstruction}\nYou are a senior resume strategist. Analyze the resume against the job description. Return: {"score": number, "strengths": string[], "weaknesses": string[], "recommendations": string[]}. Be strict, practical, and professional.`,
    "match-score": `${jsonInstruction}\nYou are an ATS scoring engine. Return: {"score": number, "summary": string, "details": string[], "missingKeywords": string[], "recommendations": string[]}. Score must be 0-100 and realistic.`,
    keywords: `${jsonInstruction}\nExtract high-value ATS keywords from the job description. Return: {"summary": string, "keywords": string[], "hardSkills": string[], "softSkills": string[], "priorityKeywords": string[]}. Explain how to use them naturally.`,
    coverletter: `${jsonInstruction}\nWrite a polished, tailored cover letter. Return: {"content": string}. Keep it specific, confident, and professional.`,
    summary: `${jsonInstruction}\nCreate a powerful professional resume summary based on the resume and target role. Return: {"content": string}.`,
    translation: `${jsonInstruction}\nTranslate the provided resume content into the requested target language while preserving professional resume tone, names, dates, structure, and meaning. Return: {"content": string}.`,
    "design-resume": `${jsonInstruction}\nYou are an expert resume visual designer. Return a complete valid style object matching exactly: {"style":{"global":{},"selectors":{},"elements":{},"customCSS":""},"explanation":string}. Use professional, ATS-readable CSS property names with string or number values only.`,
    optimize: `${jsonInstruction}\nRewrite and optimize the full resume content. Return: {"summary": string, "content": object, "changes": string[]}. The content object must preserve the original content keys and update values into complete, polished, truthful, ATS-friendly resume text.`,
    rewrite: `${jsonInstruction}\nRewrite the provided bullet or text into stronger resume bullets. Return: {"content": string, "alternatives": string[]}. Use action verbs, metrics where reasonable, and executive-quality phrasing.`,
    skills: `${jsonInstruction}\nSuggest skills using only the skills section plus optional target role/job description. Return: {"summary": string, "skills": string[], "prioritySkills": string[]}. Do not rewrite the full resume.`,
    "ats-optimize": `${jsonInstruction}\nAudit ATS readiness. Return: {"score": number, "summary": string, "issues": string[], "recommendations": string[], "keywordPlan": string[]}. Do not rewrite the resume.`,
    "targeted-resume": `${jsonInstruction}\nCreate a targeted resume for the provided job description while preserving the candidate's truth and existing experience. Return: {"summary": string, "content": object, "suggestions": string[]}. The content object must preserve the original content keys and rewrite values to align with the job description and candidate skills.`,
};

function stripJsonFence(text: string) {
    return text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

function extractFirstJsonObject(text: string) {
    const cleanText = stripJsonFence(text);
    const start = cleanText.indexOf("{");
    if (start === -1) throw new Error("AI response did not contain a JSON object.");

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < cleanText.length; index += 1) {
        const char = cleanText[index];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === "\\" && inString) {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (inString) continue;

        if (char === "{") depth += 1;
        if (char === "}") depth -= 1;

        if (depth === 0) return cleanText.slice(start, index + 1);
    }

    throw new Error("AI response contained an incomplete JSON object.");
}

function looksLikeStringTerminator(text: string, quoteIndex: number) {
    for (let index = quoteIndex + 1; index < text.length; index += 1) {
        const char = text[index];
        if (/\s/.test(char)) continue;
        return char === "," || char === "}" || char === "]" || char === ":";
    }

    return true;
}

function repairUnescapedJsonStringQuotes(text: string) {
    let repaired = "";
    let inString = false;
    let escaped = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];

        if (escaped) {
            repaired += char;
            escaped = false;
            continue;
        }

        if (char === "\\" && inString) {
            repaired += char;
            escaped = true;
            continue;
        }

        if (inString) {
            if (char === "\n") {
                repaired += "\\n";
                continue;
            }

            if (char === "\r") {
                repaired += "\\r";
                continue;
            }

            if (char === "\t") {
                repaired += "\\t";
                continue;
            }
        }

        if (char === '"') {
            if (!inString) {
                inString = true;
                repaired += char;
                continue;
            }

            if (looksLikeStringTerminator(text, index)) {
                inString = false;
                repaired += char;
            } else {
                repaired += '\\"';
            }
            continue;
        }

        repaired += char;
    }

    return repaired;
}

function sanitizeJsonTextForParse(text: string) {
    return repairUnescapedJsonStringQuotes(text).replace(/,\s*([}\]])/g, "$1");
}

function parseAiJson(text: string) {
    const jsonText = extractFirstJsonObject(text);

    try {
        return JSON.parse(jsonText);
    } catch (error) {
        const repairedJsonText = sanitizeJsonTextForParse(jsonText);

        try {
            return JSON.parse(repairedJsonText);
        } catch {
            const detail = error instanceof Error ? error.message : "Unknown JSON parse error.";
            throw new Error(`AI provider returned malformed JSON: ${detail}`);
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const { tool, jobDescription = "", content = {}, selectedText = "", skillArea = "", targetLanguage = "English", styleSchema } = await request.json();

        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
        }

        if (!Object.prototype.hasOwnProperty.call(prompts, tool)) {
            return NextResponse.json({ error: "Unsupported AI tool." }, { status: 400 });
        }

        switch (tool as AITool) {
            case "analyze":
            case "match-score":
            case "keywords":
            case "coverletter":
            case "summary":
            case "translation":
            case "design-resume":
            case "optimize":
            case "rewrite":
            case "skills":
            case "ats-optimize":
            case "targeted-resume": {
                const response = await fetch(OPENROUTER_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                        "X-Title": `resume-ai-${tool}`,
                    },
                    body: JSON.stringify({
                        model: MODEL,
                        messages: [
                            { role: "system", content: prompts[tool as AITool] },
                            {
                                role: "user",
                                content: JSON.stringify({
                                    tool,
                                    jobDescription,
                                    resumeContent: content,
                                    selectedText,
                                    skillArea,
                                    targetLanguage,
                                    styleSchema,
                                }),
                            },
                        ],
                        response_format: { type: "json_object" },
                        max_tokens: 5000,
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    return NextResponse.json({ error: "AI provider request failed.", details: errorText }, { status: response.status });
                }

                const result = await response.json();
                const message = result.choices?.[0]?.message?.content;
                if (!message) return NextResponse.json({ error: "AI provider returned an empty response." }, { status: 502 });
                return NextResponse.json(parseAiJson(message), { status: 200 });
            }
        }
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected AI route error." }, { status: 400 });
    }
}
