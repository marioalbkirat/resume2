import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name} = body;
        if (!name ) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }
        const user = await prisma.user.create({
            data: {
                name,
            }
        });
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}