'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

type CommunityTemplateRequest = {
    id: string;
    name: string;
    description: string;
    previewImage: string;
    category: 'ATS' | 'REGULAR';
    targetRoles: string[];
    createdAt: string;
    user: { id: string; name: string | null; email: string | null };
};

const formatDate = (value: string) => new Date(value).toLocaleString();

export default function CommunityTemplateRequestsPage() {
    const [templates, setTemplates] = useState<CommunityTemplateRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        let active = true;
        fetch('/api/admin/community-templates')
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Failed to fetch community template requests')))
            .then((data: CommunityTemplateRequest[]) => { if (active) setTemplates(data); })
            .catch(error => Swal.fire({ icon: 'error', title: 'Load failed', text: error instanceof Error ? error.message : 'Unable to load requests.' }))
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const handleView = (id: string) => {
        router.push(`/resume/template/${id}`);
    };

    const approveTemplate = async (template: CommunityTemplateRequest) => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Approve community template?',
            text: `Approve "${template.name}" and make it visible in Community Templates?`,
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Approve',
        });
        if (!result.isConfirmed) return;

        try {
            setApprovingId(template.id);
            const response = await fetch(`/api/admin/community-templates/${template.id}`, { method: 'PATCH' });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to approve request');
            }
            setTemplates(previous => previous.filter(item => item.id !== template.id));
            await Swal.fire({ icon: 'success', title: 'Approved', text: 'Template is now visible in Community Templates.', timer: 1400, showConfirmButton: false });
        } catch (error) {
            await Swal.fire({ icon: 'error', title: 'Approval failed', text: error instanceof Error ? error.message : 'Unable to approve request.' });
        } finally {
            setApprovingId(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Community Template Requests</h1>
                <p className="mt-2 text-gray-600">Review templates users requested to publish before making them visible to the community.</p>
            </div>
            {loading ? <div className="rounded-lg border bg-white p-6 text-gray-500">Loading requests...</div> : templates.length === 0 ? <div className="rounded-lg border bg-white p-6 text-gray-500">No pending community template requests.</div> : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>{['Name', 'Preview image', 'Category', 'Target roles', 'Description', 'By user name', 'Created at', 'Actions'].map(head => <th key={head} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">{head}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {templates.map(template => (
                                    <tr key={template.id} className="transition hover:bg-blue-50/50">
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-950">{template.name}</td>
                                        <td className="px-5 py-4">
                                            <div className="relative h-24 w-18 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                                {template.previewImage ? <Image src={template.previewImage} alt={template.name} fill className="object-cover" sizes="72px" /> : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-slate-400">No preview</div>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4"><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">{template.category}</span></td>
                                        <td className="px-5 py-4 text-sm text-slate-600"><div className="flex min-w-48 flex-wrap gap-1">{template.targetRoles.length ? template.targetRoles.map(role => <span key={role} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{role}</span>) : <span>No roles</span>}</div></td>
                                        <td className="max-w-sm px-5 py-4 text-sm text-slate-600"><p className="line-clamp-3">{template.description}</p></td>
                                        <td className="px-5 py-4 text-sm text-slate-600"><div className="font-semibold text-slate-900">{template.user?.name || 'Unknown user'}</div>{template.user?.email && <div className="text-xs text-slate-500">{template.user.email}</div>}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600">{formatDate(template.createdAt)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleView(template.id)} className="text-blue-600 transition hover:text-blue-900" title="View"><EyeIcon className="h-5 w-5" /></button>
                                                <button onClick={() => approveTemplate(template)} disabled={approvingId === template.id} className="text-emerald-600 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-emerald-300" title="Approve as Community"><CheckCircleIcon className="h-5 w-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
