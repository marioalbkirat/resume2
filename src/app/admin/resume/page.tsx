'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
interface Draft {
    id: string;
    title: string;
    userId: string;
    templateId: string;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
    user: {
        name: string;
    };
    template: {
        name: string;
    };
    publishedResumes: any[];
}

export default function ResumesPage() {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        try {
            const response = await fetch('/api/admin/resumes');
            if (!response.ok) throw new Error('Failed to fetch drafts');
            const data = await response.json();
            setDrafts(data);
        } catch (err) {
            setError('Error loading resumes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this draft?')) return;

        try {
            const response = await fetch(`/api/admin/resumes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            setDrafts(drafts.filter(draft => draft.id !== id));
            alert('Draft deleted successfully');
        } catch (err) {
            alert('Error deleting draft');
            console.error(err);
        }
    };

    const handleView = (id: string) => {
        router.push(`/resume/preview/${id}`);
    };

    const handleEdit = (id: string) => {
        router.push(`/admin/resume/edit/${id}`);
    };

    const handlePublish = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/resumes/${id}/publish`, {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to publish');

            alert('Resume published successfully!');
            fetchDrafts(); // Refresh the list
        } catch (err) {
            alert('Error publishing resume');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading resumes...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resume Drafts</h1>
                    <p className="text-gray-600 mt-1">Manage all resume drafts and published resumes</p>
                </div>
                <Link
                    href="/admin/resume/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create New Draft
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Template
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pinned
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Updated
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {drafts.map((draft) => (
                            <tr key={draft.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {draft.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {draft.user?.name || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {draft.template?.name || 'No template'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {draft.publishedResumes && draft.publishedResumes.length > 0 ? (
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Published
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Draft
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {draft.isPinned ? '📌 Yes' : 'No'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(draft.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleView(draft.id)}
                                            className="text-blue-600 hover:text-blue-900 transition"
                                            title="View"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(draft.id)}
                                            className="text-green-600 hover:text-green-900 transition"
                                            title="Edit"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        {(!draft.publishedResumes || draft.publishedResumes.length === 0) && (
                                            <button
                                                onClick={() => handlePublish(draft.id)}
                                                className="text-purple-600 hover:text-purple-900 transition"
                                                title="Publish"
                                            >
                                                <DocumentDuplicateIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(draft.id)}
                                            className="text-red-600 hover:text-red-900 transition"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {drafts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No drafts found. Create your first resume!</p>
                    </div>
                )}
            </div>
        </div>
    );
}