'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SectionBuilderUI from '@/hooks/sectionBuilder/SectionBuilderUI';
import { useSectionServices } from '@/context/section/SectionServicesContext';
import Swal from 'sweetalert2';
import { Content } from '@/types/resume/Content';
import { Schema, Section } from '@/types/resume/Section';

export default function Page() {
    const [section, setSection] = useState<Section | null>(null);
    const [builderData, setBuilderData] = useState<{ schema: Schema; content: Record<string, Content> } | null>(null);
    const { getSectionById, updateSection } = useSectionServices();
    const params = useParams();
    const router = useRouter();
    const [name, setName] = useState("");
    useEffect(() => { (async () => { const id = params.id; if (typeof id !== "string") return; const data = await getSectionById(id); if (!data) { await Swal.fire({ icon: "error", title: "Not found", text: "Section not found." }); router.push("/admin/section"); return; } setSection(data); setBuilderData({ schema: data.schema, content: data.content }); setName(data.name); })(); }, [params.id, getSectionById, router]);
    const handleSubmit = async () => {
        if (!section || !builderData || typeof params.id !== "string") return;
        if (!name.trim()) {
            await Swal.fire({ icon: "warning", title: "Invalid section name", text: "Section name is required." });
            return;
        }
        try {
            await updateSection(params.id, { name: name.trim(), target: "RESUME", visibility: "OFFICIAL", schema: builderData.schema, content: builderData.content });
            await Swal.fire({ icon: "success", title: "Updated", text: "Section updated successfully." });
            router.push("/admin/section/");
        } catch (error) {
            await Swal.fire({ icon: "error", title: "Update failed", text: error instanceof Error ? error.message : "Unable to update section." });
        }
    };
    if (!section || !builderData) return <div className="container mx-auto px-4 py-8">Loading section...</div>;
    return <div className="container mx-auto px-4 py-8"><div className="mb-6"><h1 className="text-3xl font-bold text-gray-900">Edit Section</h1><p className="text-gray-600 mt-2">Edit section: {section.name}</p></div><label className="block text-sm font-medium text-gray-700 mb-2">Section Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /><div className="mt-6"><SectionBuilderUI content={builderData.content} schema={builderData.schema} sectionName={name} onExport={setBuilderData} /></div><button onClick={handleSubmit} className="mt-6 cursor-pointer px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700">Update Section</button></div>;
}
