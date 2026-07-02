// D:\cvBuilder\resumebuilder\src\app\api\admin\templates\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';
import { ResumeCategory } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const visibility = formData.get('visibility') as string;
        const description = formData.get('description') as string;
        const targetRoles = JSON.parse(formData.get('targetRoles') as string);
        const engine = JSON.parse(formData.get('engine') as string);
        const styles = JSON.parse(formData.get('styles') as string);
        const category = formData.get('category') as ResumeCategory;
        const previewImage = formData.get('previewImage') as File | null;

        let previewImagePath = null;

        if (previewImage) {
            // Create directory if it doesn't exist
            const uploadDir = path.join(process.cwd(), 'public', 'resumes');
            await mkdir(uploadDir, { recursive: true });

            // Generate unique filename
            const timestamp = Date.now();
            const extension = previewImage.name.split('.').pop();
            const filename = `${timestamp}-${previewImage.name}`;
            const filePath = path.join(uploadDir, filename);

            // Save file
            const bytes = await previewImage.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filePath, buffer);

            previewImagePath = `/resumes/${filename}`;
        }

        const template = await prisma.resumeTemplate.create({
            data: {
                name,
                visibility: visibility as any,
                description,
                targetRoles,
                engine,
                styles,
                previewImage: previewImagePath || '',
                category: category as ResumeCategory,
                downloads: 0,
                likes: 0,
                views: 0,
                saves: 0,
                forks: 0,
            }
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const templates = await prisma.resumeTemplate.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                previewImage: true,
                visibility: true,
                downloads: true,
                likes: true,
                engine: true,
                styles: true,
                views: true,
                category: true,
                createdAt: true
            }
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}