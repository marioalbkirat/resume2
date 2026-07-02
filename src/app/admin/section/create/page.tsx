'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionBuilderUI from "@/hooks/sectionBuilder/SectionBuilderUI";
import { SectionTarget } from '@prisma/client';
import { CreateSection } from '@/classes/section';
import { useSectionServices } from '@/context/section/SectionServicesContext';
export default function CreateSectionPage() {
    const router = useRouter();
    const { createSection, section } = useSectionServices();
    const [name, setName] = useState<string>("");
    const [target, setTarget] = useState<SectionTarget>("RESUME");
    const visibility = "OFFICIAL";
    const handleSubmit = async () => {
        const sectionForm: CreateSection = { name, visibility, target, schema: section };
        await createSection(sectionForm);
        router.push("/admin/section");
    };
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Create New Section</h1>
                <p className="text-gray-600 mt-2">Create a new section for resumes or portfolios</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., languages, experience, education"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target *
                    </label>
                    <select
                        name="target"
                        value={target}
                        onChange={(e) => setTarget(e.target.value as SectionTarget)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={SectionTarget.RESUME}>{SectionTarget.RESUME}</option>
                        <option value={SectionTarget.PORTFOLIO}>{SectionTarget.PORTFOLIO}</option>
                    </select>
                </div>
            </div>
            <SectionBuilderUI sectionName={"sectionName"} />
            <button onClick={handleSubmit} className="cursor-pointer px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95" >
                Create Section
            </button>
        </div>
    )
}