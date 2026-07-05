'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { Section } from '@/types/resume/Section';
import { useSectionServices } from '@/context/section/SectionServicesContext';

type CreatorFilter = 'ALL' | 'ADMIN' | 'USER';
type VisibilityFilter = 'ALL' | 'OFFICIAL' | 'COMMUNITY' | 'PRIVATE';
type DateSort = 'desc' | 'asc';

export default function SectionsPage() {
    const { getSections, deleteSection } = useSectionServices();
    const [sections, setSections] = useState<Section[]>([]);
    const [creatorFilter, setCreatorFilter] = useState<CreatorFilter>('ALL');
    const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('ALL');
    const [search, setSearch] = useState('');
    const [dateSort, setDateSort] = useState<DateSort>('desc');

    useEffect(() => {
        let active = true;
        getSections().then(data => { if (active) setSections(data); });
        return () => { active = false; };
    }, [getSections]);

    const handleDelete = async (section: Section) => {
        if (section.visibility !== 'OFFICIAL' || !section.user?.isAdmin) return;
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete section?',
            text: `Are you sure you want to delete "${section.name}"?`,
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Delete',
        });
        if (!result.isConfirmed) return;
        try {
            await deleteSection(section.id);
            setSections(prev => prev.filter(item => item.id !== section.id));
            await Swal.fire({ icon: 'success', title: 'Deleted', text: 'Section deleted successfully.', timer: 1400, showConfirmButton: false });
        } catch (error) {
            await Swal.fire({ icon: 'error', title: 'Delete failed', text: error instanceof Error ? error.message : 'Unable to delete section.' });
        }
    };

    const filteredSections = useMemo(() => sections
        .filter(section => creatorFilter === 'ALL' || (creatorFilter === 'ADMIN' ? section.user?.isAdmin : !section.user?.isAdmin))
        .filter(section => visibilityFilter === 'ALL' || section.visibility === visibilityFilter)
        .filter(section => section.name.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => dateSort === 'desc' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        [sections, creatorFilter, visibilityFilter, search, dateSort]);

    const getTargetBadgeColor = (target: string) => target === 'RESUME' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    const getVisibilityBadgeColor = (visibility: string) => {
        switch (visibility) {
            case 'OFFICIAL': return 'bg-purple-100 text-purple-800';
            case 'COMMUNITY': return 'bg-green-100 text-green-800';
            case 'PRIVATE': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Sections Management</h1>
                <Link href="/admin/section/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer">+ Create New Section</Link>
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by section name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={creatorFilter} onChange={(event) => setCreatorFilter(event.target.value as CreatorFilter)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm cursor-pointer">
                    <option value="ALL">All creators</option><option value="ADMIN">Admin</option><option value="USER">User</option>
                </select>
                <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm cursor-pointer">
                    <option value="ALL">All visibility</option><option value="OFFICIAL">OFFICIAL</option><option value="COMMUNITY">COMMUNITY</option><option value="PRIVATE">PRIVATE</option>
                </select>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Date</span>
                    <button onClick={() => setDateSort('asc')} className={`cursor-pointer rounded-md border px-3 py-2 ${dateSort === 'asc' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>↑</button>
                    <button onClick={() => setDateSort('desc')} className={`cursor-pointer rounded-md border px-3 py-2 ${dateSort === 'desc' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>↓</button>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSections.map((section) => {
                            const canDelete = section.visibility === 'OFFICIAL' && Boolean(section.user?.isAdmin);
                            return <tr key={section.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{section.name}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{section.user?.isAdmin ? 'admin' : 'user'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{section.user?.email || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTargetBadgeColor(section.target)}`}>{section.target}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVisibilityBadgeColor(section.visibility)}`}>{section.visibility}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(section.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="inline-flex gap-2">
                                    <Link href={`/admin/section/edit/${section.id}`} className="cursor-pointer rounded-md bg-blue-50 px-3 py-1.5 text-blue-700 hover:bg-blue-100">Edit</Link>
                                    {canDelete && <button onClick={() => handleDelete(section)} className="cursor-pointer rounded-md bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100">Delete</button>}
                                </div></td>
                            </tr>;
                        })}
                    </tbody>
                </table>
                {filteredSections.length === 0 && <div className="text-center py-12"><p className="text-gray-500">No sections found.</p></div>}
            </div>
        </div>
    );
}
