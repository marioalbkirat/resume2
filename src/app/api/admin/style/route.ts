// D:\cvBuilder\resumebuilder\src\app\api\admin\style\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Section } from '@/types/resume/Section';
import { SectionStyle } from '@/types/resume/SectionStyle';
import { SchemaNode } from '@/types/resume/schemaSection';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// قائمة النماذج المتاحة على OpenRouter
const AVAILABLE_MODELS = [
    // 'openai/gpt-4o',
    'cohere/north-mini-code:free',
];

export async function POST(request: NextRequest) {
    try {
        const { sections, prompt, currentStyle } = await request.json();

        if (!sections || !sections.length) {
            return NextResponse.json(
                { error: 'No sections provided' },
                { status: 400 }
            );
        }

        if (!OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: 'OpenRouter API key is not configured' },
                { status: 500 }
            );
        }

        // Build the schema structure for the AI
        const schemaStructure = buildSchemaStructure(sections);

        // Create the system prompt
        const systemPrompt = createSystemPrompt();

        // Create the user prompt with schema and user request
        const userPrompt = createUserPrompt(schemaStructure, prompt, currentStyle);

        // Try multiple models in order
        let lastError = null;
        let modelToUse = null;

        // First try to find a working model
        for (const model of AVAILABLE_MODELS) {
            try {
                // Test if model is available with a lightweight request
                const testResponse = await fetch(OPENROUTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                        'X-Title': 'Resume Builder Style Generator',
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful assistant. Respond with "OK".',
                            },
                            {
                                role: 'user',
                                content: 'Say OK',
                            },
                        ],
                        max_tokens: 10,
                    }),
                });

                if (testResponse.ok) {
                    modelToUse = model;
                    break;
                }
            } catch (error) {
                console.warn(`Model ${model} not available:`, error);
                continue;
            }
        }

        // If no model was found, use the first one as fallback
        if (!modelToUse) {
            modelToUse = AVAILABLE_MODELS[0];
            console.warn('No working model found, using fallback:', modelToUse);
        }


        // Call OpenRouter API with the selected model
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'Resume Builder Style Generator',
            },
            body: JSON.stringify({
                model: modelToUse,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: userPrompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 20000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter API error:', errorData);

            // Try with a different model if the first one failed
            if (modelToUse !== AVAILABLE_MODELS[AVAILABLE_MODELS.length - 1]) {
                const fallbackModel = AVAILABLE_MODELS.find(m => m !== modelToUse) || AVAILABLE_MODELS[0];

                const retryResponse = await fetch(OPENROUTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                        'X-Title': 'Resume Builder Style Generator',
                    },
                    body: JSON.stringify({
                        model: fallbackModel,
                        messages: [
                            {
                                role: 'system',
                                content: systemPrompt,
                            },
                            {
                                role: 'user',
                                content: userPrompt,
                            },
                        ],
                        temperature: 0.7,
                        max_tokens: 20000,
                    }),
                });

                if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    const generatedStyles = parseAIResponse(retryData.choices[0].message.content, sections);
                    return NextResponse.json({
                        success: true,
                        styles: generatedStyles,
                        model: fallbackModel,
                    });
                }
            }

            return NextResponse.json(
                { error: 'Failed to generate styles from AI', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        const generatedStyles = parseAIResponse(data.choices[0].message.content, sections);
        return NextResponse.json({
            success: true,
            styles: generatedStyles,
            model: modelToUse,
        });

    } catch (error) {
        console.error('Error generating styles:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// ========================
// HELPER FUNCTIONS
// ========================

function buildSchemaStructure(sections: Section[]): any {
    return sections.map(section => ({
        id: section.id,
        name: section.name,
        schema: buildNodeStructure(section.schema),
    }));
}

function buildNodeStructure(node: SchemaNode): any {
    return {
        id: node.id,
        tag: node.tag,
        name: node.name,
        type: node.type,
        value: node.value,
        children: node.children?.map(child => buildNodeStructure(child)) || [],
    };
}

function createSystemPrompt(): string {
    return `
You are an expert UI/UX designer and CSS stylist. Your task is to generate beautiful, professional styles for resume sections.

**Your Role:**
- You will receive a schema structure of resume sections with their elements (headings, text, lists, etc.)
- You need to apply appropriate CSS styles to each element to create a cohesive, visually appealing design

**Style Guidelines:**
1. **Professional & Clean**: Use modern, professional designs suitable for resumes
2. **Consistency**: Maintain consistent styling across similar elements
3. **Readability**: Ensure text is readable with proper contrast
4. **Hierarchy**: Use size, weight, and color to establish visual hierarchy
5. **Modern Design**: Use current design trends (subtle shadows, rounded corners, gentle colors)

**Color Palette Options:**
- Professional: Blues, grays, whites
- Modern: Indigo, purple, teal
- Minimal: Black, white, gray
- Warm: Orange, amber, cream
- Elegant: Navy, gold, white

**Common Style Values:**
- Colors: Use hex codes (#ffffff, #1f2937, etc.)
- Font sizes: 12px-32px depending on element importance
- Spacing: Use consistent padding and margins (4px, 8px, 16px, 24px)
- Border radius: 4px-16px for modern look

**Response Format:**
Return a JSON array of SectionStyle objects matching the exact structure:
[
    {
        "id": "section_id_or_node_id",
        "style": {
            "property": "value"
        },
        "children": [
            {
                "id": "child_node_id",
                "style": {
                    "property": "value"
                },
                "children": [...]
            }
        ]
    }
]

**Important Rules:**
1. Only include styles that are relevant to the element type
2. Use consistent spacing units (px)
3. Don't use shorthand and longhand together (e.g., don't use both 'border' and 'borderBottom')
4. Keep styles clean and minimal - only override what's needed
5. Match the exact ID structure from the provided schema
6. Ensure every node in the schema has a corresponding style entry

**Available CSS Properties:**
- backgroundColor, color, padding, margin, fontSize, fontWeight, textAlign
- border, borderRadius, borderBottom, borderTop, borderLeft, borderRight
- display, flexDirection, alignItems, justifyContent, gap
- lineHeight, letterSpacing, textTransform, boxShadow
- listStyle, width, height, objectFit, cursor, textDecoration

Generate styles that are clean, professional, and visually appealing.`;
}

function createUserPrompt(schemaStructure: any, userPrompt: string, currentStyle?: SectionStyle[]): string {
    let prompt = `
**Current Schema:**
${JSON.stringify(schemaStructure, null, 2)}

**User Request:**
${userPrompt || 'Create a modern, professional design with a clean aesthetic.'}

`;

    if (currentStyle && currentStyle.length > 0) {
        prompt += `
**Current Styles (for reference):**
${JSON.stringify(currentStyle, null, 2)}

Use these as a baseline and enhance based on the user request.
`;
    }

    prompt += `
**Instructions:**
1. Generate styles for ALL nodes in the schema
2. Each node must have a style object with appropriate CSS properties
3. Return ONLY the JSON array, no other text
4. Make the design cohesive and professional
5. Ensure all colors work well together

Generate the styles now:
`;

    return prompt;
}

function parseAIResponse(content: string, sections: Section[]): SectionStyle[] {
    try {
        // Try to extract JSON from the response
        let jsonStr = content;

        // Find JSON array in the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        const parsed = JSON.parse(jsonStr);

        // Validate and transform the parsed data
        if (Array.isArray(parsed)) {
            return validateAndFixStyles(parsed, sections);
        }

        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Failed to parse AI response:', error);
        console.error('Raw content:', content);
        throw new Error('Failed to parse AI generated styles');
    }
}

function validateAndFixStyles(
    styles: any[],
    sections: Section[]
): SectionStyle[] {
    // Create a map of all node IDs from sections
    const allNodeIds = new Set<string>();
    sections.forEach(section => {
        collectNodeIds(section.schema, allNodeIds);
    });

    // Fix and validate each style
    return styles.map(style => ({
        id: allNodeIds.has(style.id) ? style.id : findMatchingId(style.id, sections) || style.id,
        style: sanitizeStyles(style.style || {}),
        children: Array.isArray(style.children)
            ? validateAndFixStyles(style.children, sections)
            : [],
    }));
}

function collectNodeIds(node: SchemaNode, ids: Set<string>) {
    ids.add(node.id);
    if (node.children) {
        node.children.forEach(child => collectNodeIds(child, ids));
    }
}

function findMatchingId(id: string, sections: Section[]): string | null {
    // Try to find by name or tag if ID doesn't match exactly
    for (const section of sections) {
        const allNodes = getAllSchemaNodes(section.schema);
        const found = allNodes.find(n =>
            n.node.name === id ||
            n.node.tag === id
        );
        if (found) return found.node.id;
    }
    return null;
}

function getAllSchemaNodes(node: SchemaNode): { node: SchemaNode; path: string[] }[] {
    const result: { node: SchemaNode; path: string[] }[] = [];
    const traverse = (n: SchemaNode, path: string[]) => {
        result.push({ node: n, path });
        if (n.children) {
            n.children.forEach(child => traverse(child, [...path, child.name]));
        }
    };
    traverse(node, [node.name]);
    return result;
}

function sanitizeStyles(styles: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const allowedProperties = [
        'backgroundColor', 'color', 'padding', 'margin', 'fontSize',
        'fontWeight', 'textAlign', 'border', 'borderRadius', 'borderBottom',
        'borderTop', 'borderLeft', 'borderRight', 'display', 'flexDirection',
        'alignItems', 'justifyContent', 'gap', 'lineHeight', 'letterSpacing',
        'textTransform', 'boxShadow', 'listStyle', 'width', 'height',
        'objectFit', 'cursor', 'textDecoration'
    ];

    Object.entries(styles).forEach(([key, value]) => {
        // Only allow allowed properties
        if (allowedProperties.includes(key) && value && value !== 'undefined' && value !== 'null') {
            // Remove conflict between border and border sides
            if (key === 'border' && styles.borderBottom) {
                delete sanitized.borderBottom;
                delete sanitized.borderTop;
                delete sanitized.borderLeft;
                delete sanitized.borderRight;
            }
            if (key.startsWith('border') && key !== 'border' && styles.border) {
                delete sanitized.border;
            }
            sanitized[key] = value;
        }
    });

    return sanitized;
}