// D:\cvBuilder\resumebuilder\src\app\api\admin\templates\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const visibility = formData.get('visibility') as string;
        const description = formData.get('description') as string;
        const targetRoles = JSON.parse(formData.get('targetRoles') as string);
        const settings = JSON.parse(formData.get('settings') as string);
        const distribution = JSON.parse(formData.get('distribution') as string);
        const style = JSON.parse(formData.get('style') as string);
        const content = JSON.parse((formData.get('content') as string) || "{}");
        const category = formData.get('category') as "ATS" | "REGULAR";
        const previewImage = formData.get('previewImage') as File | null;

        let previewImagePath = null;

        if (previewImage) {
            // Create directory if it doesn't exist
            const uploadDir = path.join(process.cwd(), 'public', 'resumes');
            await mkdir(uploadDir, { recursive: true });

            // Generate unique filename
            const timestamp = Date.now();
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
                visibility: visibility as "OFFICIAL" | "COMMUNITY" | "PRIVATE",
                description,
                targetRoles,
                settings,
                distribution,
                style,
                content,
                authorId: "cmqtlhdub0000t9rselto3b16",
                previewImage: previewImagePath || '',
                category,
                downloads: 0,
                likes: 0,
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
        const isDashboard = request.nextUrl.searchParams.get('dashboard') === '1';

        if (!isDashboard) {
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
                    settings: true,
                    distribution: true,
                    style: true,
                    content: true,
                    authorId: true,
                    communityRequested: true,
                    forks: true,
                    user: { select: { name: true } },
                    category: true,
                    templateLikes: { where: { userId: 'cmqzvcgn80000t9x89yni4fg9' }, select: { userId: true } },
                    createdAt: true,
                },
            });

            return NextResponse.json(templates.map(({ templateLikes, user, ...template }: { templateLikes: { userId: string }[]; user?: { name: string | null }; [key: string]: unknown }) => ({ ...template, authorName: user?.name ?? "Unknown user", isLiked: templateLikes.length > 0 })));
        }
        const [templates, totals, draftCount] = await Promise.all([
            prisma.resumeTemplate.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true, isAdmin: true } },
                    templateLikes: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' } },
                    templateDownloads: { include: { user: { select: { id: true, name: true, email: true, resumeUserAnalyses: { select: { visitsCount: true, downloadsCount: true } } } } }, orderBy: { createdAt: 'desc' } },
                    templateForks: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' } },
                    drafts: {
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            userId: true,
                            title: true,
                            previewImage: true,
                            isDownloaded: true,
                            isLinkedWithPortfolio: true,
                            slug: true,
                            createdAt: true,
                            updatedAt: true,
                            user: { select: { id: true, name: true, email: true, resumeUserAnalyses: { select: { visitsCount: true, downloadsCount: true } } } },
                        },
                    },
                    _count: { select: { drafts: true } },
                },
            }),
            prisma.resumeTemplate.aggregate({ _sum: { downloads: true, likes: true, forks: true } }),
            prisma.resumeDraft.count(),
        ]);

        return NextResponse.json({
            stats: {
                downloads: totals._sum.downloads || 0,
                likes: totals._sum.likes || 0,
                forks: totals._sum.forks || 0,
                resumeDrafts: draftCount,
            },
            templates,
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}
