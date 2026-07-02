import { Engine } from '../page';

interface VisualPreviewProps {
    engine: Engine;
}

const sectionNames: { [key: string]: string } = {
    contact: 'Contact Information',
    profile: 'Professional Profile',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    image: 'Photo',
    header: 'Header',
    languages: 'Languages',
    achievements: 'Achievements',
    volunteer: 'Volunteer Experience'
};

export default function VisualPreview({ engine }: VisualPreviewProps) {
    const { layout, settings } = engine;
    const distribution = engine.layout.distribution;
    const isTwoColumns = layout.columns === "TWO";

    // Get sections from distribution
    const getSections = () => {
        if (!distribution) return [];
        return Object.keys(distribution)
            .filter(id => distribution[id].visible !== false)
            .sort((a, b) => (distribution[a]?.order || 0) - (distribution[b]?.order || 0));
    };

    const sectionIds = getSections();

    // Split sections based on column layout
    const leftSections = isTwoColumns
        ? sectionIds.filter(id => distribution[id]?.position === 'left')
        : [];

    const rightSections = isTwoColumns
        ? sectionIds.filter(id => distribution[id]?.position === 'right')
        : sectionIds;

    const renderSection = (sectionId: string, index: number) => {
        const section = distribution[sectionId];
        const showIcon = section?.showIcon ?? settings.showIcons;

        return (
            <div
                key={sectionId}
                className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-sm hover:border-blue-400 transition-all group"
                style={{ order: section?.order || index + 1 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm cursor-move">⋮⋮</span>
                        <span className="font-medium text-gray-700 text-sm">
                            {showIcon && <span className="mr-1">{getSectionIcon(sectionId)}</span>}
                            {sectionNames[sectionId] || sectionId}
                        </span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        #{section?.order || index + 1}
                    </span>
                </div>
                <div className="h-8 bg-gray-100 rounded animate-pulse">
                    <div className="h-full w-3/4 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    };

    const getSectionIcon = (sectionId: string): string => {
        const icons: { [key: string]: string } = {
            contact: '📞',
            profile: '👤',
            experience: '💼',
            education: '🎓',
            skills: '⚡',
            projects: '🚀',
            certifications: '📜',
            image: '📷',
            header: '📌',
            languages: '🌐',
            achievements: '🏆',
            volunteer: '🤝'
        };
        return icons[sectionId] || '📄';
    };
    return (
        <div className="bg-gray-100 p-6 rounded-xl sticky top-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
                <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {settings.pageSize} • {isTwoColumns ? '2 Columns' : '1 Column'}
                    {isTwoColumns && ` • Sidebar: ${layout.sidebar?.position || 'LEFT'}`}
                    {settings.direction === 'RTL' && ' • RTL'}
                </div>
            </div>

            <div className="bg-white shadow-2xl rounded-lg overflow-hidden" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>📄 {settings.pageSize} Document</span>
                        <span>Preview Mode</span>
                    </div>
                </div>

                <div className="p-6" dir={settings.direction === 'RTL' ? 'rtl' : 'ltr'}>
                    {sectionIds.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-12 bg-gray-50 rounded">
                            No sections selected. Add sections from the selector above.
                        </div>
                    ) : isTwoColumns ? (
                        <div className="flex gap-4">
                            <div
                                className={`w-1/3 ${layout.sidebar?.position === 'LEFT' ? 'order-1' : 'order-2'}`}
                            >
                                <div className="space-y-3">
                                    {leftSections.length > 0 ? (
                                        leftSections.map((id, idx) => renderSection(id, idx))
                                    ) : (
                                        <div className="text-center text-gray-400 text-sm py-8 bg-gray-50 rounded">
                                            No sections in sidebar
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div
                                className={`w-2/3 ${layout.sidebar?.position === 'LEFT' ? 'order-2' : 'order-1'}`}
                            >
                                <div className="space-y-3">
                                    {rightSections.length > 0 ? (
                                        rightSections.map((id, idx) => renderSection(id, idx))
                                    ) : (
                                        <div className="text-center text-gray-400 text-sm py-8 bg-gray-50 rounded">
                                            No sections in main column
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sectionIds.map((id, idx) => renderSection(id, idx))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-4 justify-center flex-wrap">
                    <span className="flex items-center gap-1">
                        <span className="text-gray-400">⋮⋮</span> Drag to reorder
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 bg-gray-200 rounded"></span> Section placeholder
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-xs bg-gray-100 px-1 rounded">#1</span> Order number
                    </span>
                    {settings.showIcons && (
                        <span className="flex items-center gap-1">
                            <span>📄</span> Icons enabled
                        </span>
                    )}
                    {isTwoColumns && (
                        <span className="flex items-center gap-1">
                            <span className="text-blue-500">●</span>
                            {leftSections.length} left • {rightSections.length} right
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}