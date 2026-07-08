"use client";

import { useRouter } from "next/navigation";
import ResumeCardSEO from "@/app/resume/components/cards/ResumeCardSEO";

type OfficialTemplateCard = {
    id: string;
    name: string;
    previewImage?: string | null;
    forks: number;
    downloads: number;
    likes: number;
};

interface HomeOfficialTemplatesProps {
    templates: OfficialTemplateCard[];
}

export default function HomeOfficialTemplates({ templates }: HomeOfficialTemplatesProps) {
    const router = useRouter();

    const handlePreview = (id: string) => {
        router.push(`/resume/template/${id}`);
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">Official templates</p>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-5xl">Choose a resume template before signing in</h1>
                <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
                    Browse all official resume templates and preview the design that fits your next application.
                </p>
            </div>

            {templates.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {templates.map((template) => (
                        <ResumeCardSEO
                            key={template.id}
                            id={template.id}
                            name={template.name}
                            previewImage={template.previewImage ?? undefined}
                            forks={template.forks}
                            downloads={template.downloads}
                            likes={template.likes}
                            onPreview={handlePreview}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                    No official resume templates are available yet.
                </div>
            )}
        </section>
    );
}
