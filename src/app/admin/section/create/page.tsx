'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionBuilderUI from "@/hooks/sectionBuilder/SectionBuilderUI";
import { CreateSection } from '@/classes/section';
import { useSectionServices } from '@/context/section/SectionServicesContext';
import { Content } from '@/types/resume/Content';
import { Schema } from '@/types/resume/Section';

const emptySchema = (name: string): Schema => ({ id: crypto.randomUUID(), tag: "section", type: "section", name, children: [] });

export default function CreateSectionPage() {
    const router = useRouter();
    const { createSection } = useSectionServices();
    const [name, setName] = useState("");
    const [builderData, setBuilderData] = useState<{ schema: Schema; content: Record<string, Content> }>({ schema: emptySchema("Official section"), content: {} });
    const handleSubmit = async () => {
        if (!name.trim()) return alert("Section name is required");
        const sectionForm: CreateSection = { name: name.trim(), visibility: "OFFICIAL", target: "RESUME", schema: { ...builderData.schema, name: name.trim() }, content: builderData.content };
        await createSection(sectionForm);
        router.push("/admin/section");
    };
    return <div className="container mx-auto px-4 py-8"><div className="mb-6"><h1 className="text-3xl font-bold text-gray-900">Create New Section</h1><p className="text-gray-600 mt-2">Create an official resume section.</p></div><label className="block text-sm font-medium text-gray-700 mb-2">Section Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Languages" /><div className="mt-6"><SectionBuilderUI sectionName={name || "Official section"} onExport={setBuilderData} /></div><button onClick={handleSubmit} className="mt-6 cursor-pointer px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700">Create Section</button></div>;
}
