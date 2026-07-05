'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Section } from '@/types/resume/Section';
import { useSectionServices } from '@/context/section/SectionServicesContext';
export default function SectionsPage() {
    const { getSections, deleteSection } = useSectionServices();
    const [sections, setSections] = useState<Section[]>([]);
    useEffect(() => {
        const loadSections = async () => {
            const data = await getSections();
            setSections(data);
        };
        loadSections();
    }, [getSections]);
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        await deleteSection(id);
    };
    const getTargetBadgeColor = (target: string) => {
        switch (target) {
            case 'RESUME': return 'bg-blue-100 text-blue-800';
            case 'PORTFOLIO': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getVisibilityBadgeColor = (visibility: string) => {
        switch (visibility) {
            case 'PUBLIC': return 'bg-green-100 text-green-800';
            case 'PRIVATE': return 'bg-yellow-100 text-yellow-800';
            case 'OFFICIAL': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Sections Management</h1>
                <Link
                    href="/admin/section/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Create New Section
                </Link>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Target
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Visibility
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sections.map((section) => (
                            <tr key={section.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{section.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTargetBadgeColor(section.target)}`}>
                                        {section.target}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVisibilityBadgeColor(section.visibility)}`}>
                                        {section.visibility}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(section.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/admin/section/edit/${section.id}`}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(section.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sections.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No sections found. Create your first section!</p>
                    </div>
                )}
            </div>
        </div>
    );
}