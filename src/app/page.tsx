import HomeOfficialTemplates from "./HomeOfficialTemplates";
import { prisma } from "@/lib/db";

export default async function Home() {
    const officialTemplates = await prisma.resumeTemplate.findMany({
        where: { visibility: "OFFICIAL" },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            previewImage: true,
            forks: true,
            downloads: true,
            likes: true,
        },
    });

    return (
        <main className="min-h-screen bg-slate-50">
            <HomeOfficialTemplates templates={officialTemplates} />
        </main>
    );
}
