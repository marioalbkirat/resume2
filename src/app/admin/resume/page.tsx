'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { EyeIcon, InformationCircleIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Visibility = 'OFFICIAL' | 'COMMUNITY' | 'PRIVATE';
type ResumeCategory = 'ATS' | 'REGULAR';

type UserSummary = {
    id: string;
    name: string | null;
    email: string | null;
    isAdmin?: boolean;
    resumeUserAnalyses?: { visitsCount: number; downloadsCount: number }[];
};

type TemplateAction = { createdAt: string; user: UserSummary };

type TemplateDraft = {
    id: string;
    userId: string;
    title: string;
    previewImage: string | null;
    isDownloaded: boolean;
    isLinkedWithPortfolio: boolean;
    slug: string | null;
    createdAt: string;
    updatedAt: string;
    user: UserSummary;
};

type ResumeTemplate = {
    id: string;
    name: string;
    visibility: Visibility;
    previewImage: string;
    category: ResumeCategory;
    targetRoles: string[];
    description: string;
    downloads: number;
    likes: number;
    forks: number;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    user: UserSummary;
    templateLikes: TemplateAction[];
    templateDownloads: TemplateAction[];
    templateForks: TemplateAction[];
    drafts: TemplateDraft[];
    _count: { drafts: number };
};

type DashboardResponse = {
    stats: { downloads: number; likes: number; forks: number; resumeDrafts: number };
    templates: ResumeTemplate[];
};

const emptyStats = { downloads: 0, likes: 0, forks: 0, resumeDrafts: 0 };

const formatDate = (value: string) => new Date(value).toLocaleString();
const roleLabel = (user?: UserSummary) => (user?.isAdmin ? 'admin' : 'user');
const analyticsOf = (user?: UserSummary) => user?.resumeUserAnalyses?.[0] || { visitsCount: 0, downloadsCount: 0 };

export default function ResumesPage() {
    const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
    const [stats, setStats] = useState(emptyStats);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<ResumeTemplate | null>(null);
    const router = useRouter();

    const [form, setForm] = useState({
        name: '',
        targetRoles: '',
        description: '',
        previewImage: '',
        category: 'REGULAR' as ResumeCategory,
    });

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/templates?dashboard=1');
            if (!response.ok) throw new Error('Failed to fetch templates');
            const data: DashboardResponse = await response.json();
            setTemplates(data.templates);
            setStats(data.stats);
        } catch (err) {
            setError('Error loading resume templates');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadTemplates = async () => {
            await fetchTemplates();
        };
        void loadTemplates();
    }, [fetchTemplates]);

    const openEditModal = (template: ResumeTemplate) => {
        setForm({
            name: template.name,
            targetRoles: template.targetRoles.join(', '),
            description: template.description,
            previewImage: template.previewImage,
            category: template.category,
        });
        setEditingTemplate(template);
    };

    const handleView = (id: string) => {
        router.push(`/resume/template/${id}`);
    };

    const handleDelete = async (template: ResumeTemplate) => {
        if (template.visibility !== 'OFFICIAL') return;
        if (template._count.drafts > 0) {
            await Swal.fire('Cannot delete', 'This OFFICIAL template has ResumeDraft records and cannot be deleted.', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Delete official template?',
            text: `This will permanently delete "${template.name}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626',
        });
        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/admin/templates/${template.id}`, { method: 'DELETE' });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to delete template');
            setTemplates(current => current.filter(item => item.id !== template.id));
            await Swal.fire('Deleted', 'Template deleted successfully.', 'success');
        } catch (err) {
            await Swal.fire('Error', err instanceof Error ? err.message : 'Error deleting template', 'error');
        }
    };

    const handleSaveEdit = async () => {
        if (!editingTemplate) return;
        try {
            setSaving(true);
            const response = await fetch(`/api/admin/templates/${editingTemplate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    targetRoles: form.targetRoles.split(',').map(role => role.trim()).filter(Boolean),
                    description: form.description,
                    previewImage: form.previewImage,
                    category: form.category,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to update template');
            setEditingTemplate(null);
            await fetchTemplates();
            await Swal.fire('Saved', 'Template updated successfully.', 'success');
        } catch (err) {
            await Swal.fire('Error', err instanceof Error ? err.message : 'Error updating template', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-64 items-center justify-center text-gray-500">Loading resume templates...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8" dir="ltr">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Admin Resume Center</p>
                    <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Resume templates dashboard</h1>
                    <p className="mt-2 max-w-2xl text-blue-100">Manage all ResumeTemplate records across OFFICIAL, COMMUNITY, and PRIVATE visibility.</p>
                </div>

                {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Downloads', stats.downloads],
                        ['Likes', stats.likes],
                        ['Forks', stats.forks],
                        ['ResumeDraft records', stats.resumeDrafts],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">{label}</p>
                            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>{['Name', 'Visibility', 'Category', 'Downloads', 'Likes', 'Forks', 'User email', 'Role', 'Actions'].map(head => <th key={head} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">{head}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {templates.map(template => (
                                    <tr key={template.id} className="transition hover:bg-blue-50/50">
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-950">{template.name}</td>
                                        <td className="px-5 py-4"><span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{template.visibility}</span></td>
                                        <td className="px-5 py-4 text-sm text-slate-600">{template.category}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">{template.downloads}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">{template.likes}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">{template.forks}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600">{template.user?.email || 'No email'}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600">{roleLabel(template.user)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleView(template.id)} className="text-blue-600 transition hover:text-blue-900" title="View"><EyeIcon className="h-5 w-5" /></button>
                                                <button onClick={() => setSelectedTemplate(template)} className="text-indigo-600 transition hover:text-indigo-900" title="Show information"><InformationCircleIcon className="h-5 w-5" /></button>
                                                {template.visibility === 'OFFICIAL' && <button onClick={() => openEditModal(template)} className="text-emerald-600 transition hover:text-emerald-900" title="Edit"><PencilIcon className="h-5 w-5" /></button>}
                                                {template.visibility === 'OFFICIAL' && <button onClick={() => handleDelete(template)} className="text-red-600 transition hover:text-red-900" title="Delete"><TrashIcon className="h-5 w-5" /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedTemplate && <InfoModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />}
            {editingTemplate && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-950">Edit OFFICIAL template</h2><button onClick={() => setEditingTemplate(null)}><XMarkIcon className="h-6 w-6" /></button></div>
                        <div className="mt-6 grid gap-4">
                            <Input label="Name" value={form.name} onChange={value => setForm({ ...form, name: value })} />
                            <Input label="Target roles (comma separated)" value={form.targetRoles} onChange={value => setForm({ ...form, targetRoles: value })} />
                            <Input label="Preview image URL" value={form.previewImage} onChange={value => setForm({ ...form, previewImage: value })} />
                            <label className="text-sm font-semibold text-slate-700">Category<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value as ResumeCategory })} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"><option value="ATS">ATS</option><option value="REGULAR">REGULAR</option></select></label>
                            <label className="text-sm font-semibold text-slate-700">Description<textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
                        </div>
                        <div className="mt-6 flex justify-end gap-3"><button onClick={() => setEditingTemplate(null)} className="rounded-xl border px-5 py-2 font-semibold">Cancel</button><button disabled={saving} onClick={handleSaveEdit} className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return <label className="text-sm font-semibold text-slate-700">{label}<input value={value} onChange={event => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>;
}

function UserList({ title, items }: { title: string; items: TemplateAction[] }) {
    return <section className="rounded-2xl border border-slate-200 p-4"><h3 className="font-bold text-slate-900">{title}</h3><div className="mt-3 space-y-2">{items.length ? items.map(item => <div key={`${item.user.id}-${item.createdAt}`} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"><span className="font-semibold">{item.user.name || 'Unknown user'}</span><span className="text-slate-500"> — {item.user.email || 'No email'}</span></div>) : <p className="text-sm text-slate-500">No records</p>}</div></section>;
}

function InfoModal({ template, onClose }: { template: ResumeTemplate; onClose: () => void }) {
    return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"><div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-950">{template.name}</h2><p className="text-slate-500">Template information and related activity</p></div><button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Info label="Visibility" value={template.visibility} /><Info label="Preview image" value={template.previewImage} /><Info label="Category" value={template.category} /><Info label="Target roles" value={template.targetRoles.join(', ') || 'No roles'} /><Info label="Description" value={template.description} /><Info label="Downloads" value={template.downloads} /><Info label="Likes" value={template.likes} /><Info label="Forks" value={template.forks} /><Info label="Created at" value={formatDate(template.createdAt)} /><Info label="Updated at" value={formatDate(template.updatedAt)} /><Info label="Author email" value={template.user?.email || 'No email'} /><Info label="Author role" value={roleLabel(template.user)} /></div><div className="mt-6 grid gap-4 lg:grid-cols-3"><UserList title="Liked by" items={template.templateLikes} /><UserList title="Forked by" items={template.templateForks} /><UserList title="Downloaded by" items={template.templateDownloads} /></div><section className="mt-6 rounded-2xl border border-slate-200 p-4"><h3 className="font-bold text-slate-900">ResumeDraft records forked from this template</h3><div className="mt-3 grid gap-3">{template.drafts.length ? template.drafts.map(draft => { const analytics = analyticsOf(draft.user); return <div key={draft.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><div className="font-semibold text-slate-950">{draft.title}</div><div className="mt-2 grid gap-1 md:grid-cols-2"><span>User ID: {draft.userId}</span><span>Email: {draft.user?.email || 'No email'}</span><span>Preview: {draft.previewImage || 'No preview'}</span><span>Downloaded: {draft.isDownloaded ? 'Yes' : 'No'}</span><span>Linked with portfolio: {draft.isLinkedWithPortfolio ? 'Yes' : 'No'}</span><span>Slug: {draft.slug || 'No slug'}</span><span>Created: {formatDate(draft.createdAt)}</span><span>Updated: {formatDate(draft.updatedAt)}</span><span>Visits count: {analytics.visitsCount}</span><span>Downloads count: {analytics.downloadsCount}</span></div></div>; }) : <p className="text-sm text-slate-500">No ResumeDraft records for this template.</p>}</div></section></div></div>;
}

function Info({ label, value }: { label: string; value: string | number }) {
    return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p></div>;
}
