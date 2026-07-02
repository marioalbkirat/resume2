import { NextRequest, NextResponse } from "next/server";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export async function POST(request: NextRequest) {
    try {
        const { tool, jobDescription, content } = await request.json();
        switch (tool) {
            case "analyze":
                const response = await fetch(OPENROUTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                        'X-Title': 'analyze resume',
                    },
                    body: JSON.stringify({
                        model: 'cohere/north-mini-code:free',
                        messages: [
                            {
                                role: 'system',
                                content: `
                                You are an AI assistant specialized in resume screening.

                                You must analyze a resume against a job description.

                                Return ONLY valid JSON. Do NOT return any text before or after JSON.

                                The output must follow exactly this format:

                                {
                                "score": number,
                                "strengths": string[],
                                "weaknesses": string[],
                                "recommendations": string[]
                                }

                                Rules:
                                - score must be between 0 and 100
                                - be strict and realistic
                                - strengths = what matches job well
                                - weaknesses = what is missing or weak
                                - recommendations = actionable improvements
                                - do NOT include explanations or extra text
                                `.trim(),
                            },
                            {
                                role: 'user',
                                content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${JSON.stringify(content, null, 2)}`
                            },
                        ],
                        max_tokens: 5000,
                    }),
                });
                if (response.ok) {
                    const result = await response.json();
                    const result2 = JSON.parse(result.choices[0].message.content);
                    return NextResponse.json(result2, { status: 200 });
                }
                break;
            case "coverletter":
                break;
            default:
                break;
        }
    } catch (error) {
        return NextResponse.json(error, { status: 400 });
    }
}