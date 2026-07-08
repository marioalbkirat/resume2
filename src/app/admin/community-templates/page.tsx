'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

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

    useEffect(() => {
        let active = true;
        fetch('/api/admin/community-templates')
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Failed to fetch community template requests')))
            .then((data: CommunityTemplateRequest[]) => { if (active) setTemplates(data); })
            .catch(error => Swal.fire({ icon: 'error', title: 'Load failed', text: error instanceof Error ? error.message : 'Unable to load requests.' }))
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {templates.map(template => (
                        <article key={template.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="relative aspect-3/4 bg-gray-100">
                                {template.previewImage ? <Image src={template.previewImage} alt={template.name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400">No preview</div>}
                            </div>
                            <div className="space-y-3 p-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{template.name}</h2>
                                    <p className="text-sm text-gray-500">By {template.user?.name || 'Unknown user'}{template.user?.email ? ` (${template.user.email})` : ''}</p>
                                </div>
                                <p className="line-clamp-3 text-sm text-gray-600">{template.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-800">{template.category}</span>
                                    <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-800">Requested {formatDate(template.createdAt)}</span>
                                    {template.targetRoles.map(role => <span key={role} className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">{role}</span>)}
                                </div>
                                <button onClick={() => approveTemplate(template)} disabled={approvingId === template.id} className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300">
                                    {approvingId === template.id ? 'Approving...' : 'Approve as Community'}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
