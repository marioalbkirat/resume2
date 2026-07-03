// D:\cvBuilder\resumebuilder\src\classes\section\AISectionGenerator.ts

import { Schema } from "@/types/resume/Section";
import { Content } from "@/types/resume/Content";

export type GeneratedContent = Record<string, Content> | Content[];

export interface AIGenerateRequest {
    description: string;
    sectionType?: 'resume' | 'portfolio';
    additionalRequirements?: string;
    sectionName?: string;
}

export interface AIGenerateResponse {
    schema: Schema;
    content: GeneratedContent;
    explanation?: string;
}

export class AISectionGenerator {
    private apiEndpoint: string;

    constructor(apiEndpoint: string = '/api/resume/generate-section') {
        this.apiEndpoint = apiEndpoint;
    }

    /**
     * توليد قسم باستخدام الـ AI
     */
    async generateSection(request: AIGenerateRequest): Promise<AIGenerateResponse> {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
                    ? data.details && typeof data.details === 'string'
                        ? `${data.error} ${data.details}`
                        : data.error
                    : response.statusText;
                throw new Error(`AI generation failed: ${message}`);
            }

            if (!data) {
                throw new Error('AI generation failed: empty server response');
            }
            return data as AIGenerateResponse;
        } catch (error) {
            console.error('AI Generation error:', error);
            throw error;
        }
    }

    /**
     * توليد قسم باستخدام قالب محدد
     */
    async generateFromTemplate(templateId: string, customizations?: Record<string, unknown>): Promise<AIGenerateResponse> {
        return this.generateSection({
            description: `Generate section using template ${templateId}`,
            additionalRequirements: JSON.stringify(customizations),
        });
    }

    /**
     * تحسين قسم موجود
     */
    async enhanceSection(schema: Schema, content: Content[], instructions: string): Promise<AIGenerateResponse> {
        try {
            const response = await fetch(`${this.apiEndpoint}/enhance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schema,
                    content,
                    instructions,
                }),
            });

            if (!response.ok) {
                throw new Error(`AI enhancement failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data as AIGenerateResponse;
        } catch (error) {
            console.error('AI Enhancement error:', error);
            throw error;
        }
    }
}