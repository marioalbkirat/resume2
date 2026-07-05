'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import SectionBuilderUI from "@/hooks/sectionBuilder/SectionBuilderUI";
import { CreateSection } from '@/classes/section';
import { useSectionServices } from '@/context/section/SectionServicesContext';
import { Content } from '@/types/resume/Content';
import { Schema } from '@/types/resume/Section';

const emptySchema = (): Schema => ({ id: crypto.randomUUID(), tag: "section", type: "section", children: [] });

export default function CreateSectionPage() {
    const router = useRouter();
    const { createSection, getSections } = useSectionServices();
    const [name, setName] = useState("");
    const [existingNames, setExistingNames] = useState<string[]>([]);
    const [step, setStep] = useState<1 | 2>(1);
    const [builderData, setBuilderData] = useState<{ schema: Schema; content: Record<string, Content> }>({ schema: emptySchema(), content: {} });
    const normalizedName = useMemo(() => name.trim(), [name]);

    useEffect(() => {
        getSections().then((sections) => setExistingNames(sections.filter((section) => section.visibility === "OFFICIAL").map((section) => section.name.toLowerCase()))).catch(() => setExistingNames([]));
    }, [getSections]);

    const validateName = () => {
        if (normalizedName.length < 4 || normalizedName.length > 30) {
            Swal.fire({ icon: 'warning', title: 'Invalid section name', text: 'Section name must be 4 to 30 characters.' });
            return false;
        }
        if (existingNames.includes(normalizedName.toLowerCase())) {
            Swal.fire({ icon: 'warning', title: 'Duplicate section', text: 'You already have a section with this name.' });
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateName()) setStep(2);
    };

    const handleSubmit = async () => {
        if (!validateName()) return;
        try {
            const sectionForm: CreateSection = { name: normalizedName, visibility: "OFFICIAL", target: "RESUME", schema: builderData.schema, content: builderData.content };
            await createSection(sectionForm);
            await Swal.fire({ icon: 'success', title: 'Created', text: 'Section created successfully.' });
            router.push("/admin/section");
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Create failed', text: error instanceof Error ? error.message : 'Unable to create section.' });
        }
    };

    return <div className="container mx-auto px-4 py-8 max-w-6xl"><div className="mb-6"><h1 className="text-3xl font-bold text-gray-900">Create New Section</h1><p className="text-gray-600 mt-2">Step {step} of 2: {step === 1 ? 'Name the section' : 'Build the structure'}.</p></div>{step === 1 ? <div className="bg-white rounded-lg border border-gray-200 p-5"><label className="block text-sm font-medium text-gray-700 mb-2">Section Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Languages" /><button onClick={handleNext} className="mt-6 cursor-pointer px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700">Next</button></div> : <><SectionBuilderUI sectionName={normalizedName} onExport={setBuilderData} /><div className="mt-6 flex flex-col sm:flex-row gap-3"><button onClick={() => setStep(1)} className="cursor-pointer px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Back</button><button onClick={handleSubmit} className="cursor-pointer px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700">Create Section</button></div></>}</div>;
}
