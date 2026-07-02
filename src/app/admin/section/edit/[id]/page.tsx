'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SectionBuilderUI from '@/hooks/sectionBuilder/SectionBuilderUI';
import { SectionTarget } from '@prisma/client';
import { useSectionServices } from '@/context/section/SectionServicesContext';
export default function Page() {
    const [section, setSection] = useState<any>(null);
    const [content , setContent] = useState<any>(null);
    const { getSectionById, updateSection } = useSectionServices();
    const params = useParams();
    const router = useRouter();
    const [name, setName] = useState<string>("");
    const [target, setTarget] = useState<SectionTarget>("RESUME");
    const visibility = "OFFICIAL";
    useEffect(() => {
        const fetchSection = async () => {
            const id = params.id;
            if (typeof id !== "string") return;
            const sectionData = await getSectionById(id);
            console.log(sectionData.content);
            if (sectionData){
                 setSection(sectionData.schema);
                 setContent(sectionData.content);
                 setTarget(sectionData.target);
                 setName(sectionData.name);
            }
        };
        fetchSection();
    }, [params.id]);
    const handleSubmit = async () => {
        const formData = { name, target, visibility, schema: section }
        await updateSection(params.id, formData);
        router.push("/admin/section/")
    };
    if (!section) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Section not found
                </div>
            </div>
        );
    }
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Edit Section</h1>
                <p className="text-gray-600 mt-2">Edit section: {section.name}</p>
            </div>
            <div className="container mx-auto px-4 py-3">
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
                <SectionBuilderUI content={content} schema={section} sectionName={"sectionName"} />
                <button onClick={handleSubmit} className="cursor-pointer px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95" >
                    Update Section
                </button>
            </div>
        </div>
    );
}