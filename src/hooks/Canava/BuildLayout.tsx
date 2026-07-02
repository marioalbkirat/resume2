// import { Section } from "@/types/resume/Section";
// import { Layout } from "./canava";
// import NodeRenderer from "./jsonToHtml/sectionToHtml";
// import { SectionStyle } from "@/types/resume/SectionStyle";
// import { Settings } from "@/types/resume/Settings";
// export default function BuildLayout({ layout, sections, style, onElementClick, selectedNodeId, settings }: {
//     layout: Layout;
//     sections: Section[];
//     style: SectionStyle[];
//     onElementClick?: (nodeId: string) => void;
//     selectedNodeId?: string | null;
//     settings?: Settings,
// }) {
//     if (!sections || !Array.isArray(sections) || sections.length === 0) {
//         return (
//             <div style={{
//                 width: "210mm",
//                 padding: "10mm",
//                 boxShadow: "0px 0px 3px 0px rgb(0,0,0,0.2)",
//                 textAlign: "center",
//                 color: "#9ca3af"
//             }} id="resume">
//                 <p>No sections available</p>
//             </div>
//         );
//     }
//     if (!layout || !layout.distribution) {
//         return (
//             <div style={{
//                 width: "210mm",
//                 padding: "10mm",
//                 boxShadow: "0px 0px 3px 0px rgb(0,0,0,0.2)",
//                 textAlign: "center",
//                 color: "#9ca3af"
//             }} id="resume">
//                 <p>No layout configuration available</p>
//             </div>
//         );
//     }
//     let pageSizeStyle = {};
//     if (settings?.pageSize === "A4") {
//         pageSizeStyle = {
//             width: "210mm",
//             minHeight: "297mm",
//             padding: "10mm",
//             boxShadow: "0 0 3px rgba(0,0,0,0.2)",
//         };
//     } else {
//         pageSizeStyle = {
//             width: "215.9mm",
//             minHeight: "279.4mm",
//             padding: "10mm",
//             boxShadow: "0 0 3px rgba(0,0,0,0.2)",
//         };
//     }
//     let leftSections: Section[] = [];
//     let rightSections: Section[] = [];
//     let resultRightSections;
//     let resultLeftSections;

//     // نسخ المصفوفة قبل الترتيب لتجنب تغيير المصفوفة الأصلية
//     const sortedSections = [...sections].sort((a, b) => {
//         const orderA = layout.distribution[a.name]?.order ?? Infinity;
//         const orderB = layout.distribution[b.name]?.order ?? Infinity;
//         return orderA - orderB;
//     });

//     // التحقق من وجود style
//     const safeStyle = style || [];

//     if (layout.columns === "TWO") {
//         rightSections = sortedSections.filter(section => {
//             const config = layout.distribution[section.name];
//             return config && config.position === "right";
//         });

//         leftSections = sortedSections.filter(section => {
//             const config = layout.distribution[section.name];
//             return config && config.position === "left";
//         });

//         resultRightSections = rightSections.map((s) => {
//             const secStyle = safeStyle.find(f => f.id === s.id);
//             return (
//                 <NodeRenderer
//                     style={secStyle}
//                     key={s.id}
//                     node={s.schema}
//                     id={s.id}
//                     onElementClick={onElementClick}
//                     selectedNodeId={selectedNodeId}
//                     onUpdate={() => { }} // Add empty onUpdate if needed
//                 />
//             );
//         });

//         resultLeftSections = leftSections.map((s) => {
//             const secStyle = safeStyle.find(f => f.id === s.id);
//             return (
//                 <NodeRenderer
//                     style={secStyle}
//                     key={s.id}
//                     node={s.schema}
//                     id={s.id}
//                     onElementClick={onElementClick}
//                     selectedNodeId={selectedNodeId}
//                     onUpdate={() => { }} // Add empty onUpdate if needed
//                 />
//             );
//         });
//     }

//     if (layout.columns === "ONE") {
//         const result = sortedSections.map((s) => {
//             const secStyle = safeStyle.find(f => f.id === s.schema?.id);
//             return (
//                 <NodeRenderer
//                     style={secStyle}
//                     key={s.id}
//                     node={s.schema}
//                     id={s.id}
//                     onElementClick={onElementClick}
//                     selectedNodeId={selectedNodeId}
//                     onUpdate={() => { }} // Add empty onUpdate if needed
//                 />
//             );
//         });

//         return (
//             <div dir={settings?.direction} style={pageSizeStyle} id="resume">
//                 <div className="main">{result}</div>
//             </div>
//         );
//     }

//     const sidebarLeft = layout.sidebar?.position === "LEFT";
//     return (
//         <div dir={settings?.direction} style={pageSizeStyle} id="resume">
//             {sidebarLeft ? (
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }} className="container">
//                     <div className="left-side">
//                         {resultLeftSections || []}
//                     </div>

//                     <div className="right-side">
//                         {resultRightSections || []}
//                     </div>
//                 </div>
//             ) : (
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "24px" }} className="container">
//                     <div className="left-side">
//                         {resultLeftSections || []}
//                     </div>

//                     <div className="right-side">
//                         {resultRightSections || []}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


// D:\cvBuilder\resumebuilder\src\hooks\Canava\BuildLayout.tsx
"use client";
import { Section } from "@/types/resume/Section";
import NodeRenderer from "./jsonToHtml/NodeRenderer";
import { Settings } from "@/types/resume/Settings";
import { Content } from "@/types/resume/Content";
import { useMemo } from "react";

interface BuildLayoutProps {
    sections: Section[];
    settings: Settings;
    distribution: any;
    content?: Record<string, Content>;
    mode: 'preview' | 'edit';
    selectedNodeId?: string | null;
    onNodeSelect?: (nodeId: string) => void;
    onNodeUpdate?: (sectionId: string, nodeId: string, value: string, props?: Record<string, string>) => void;
    onNodeAdd?: (sectionId: string, parentId: string) => void;
    onNodeDelete?: (sectionId: string, nodeId: string) => void;
}

export default function BuildLayout({
    sections,
    settings,
    distribution,
    content = {},
    mode,
    selectedNodeId,
    onNodeSelect,
    onNodeUpdate,
    onNodeAdd,
    onNodeDelete
}: BuildLayoutProps) {
    const isEditable = mode === 'edit';

    const pageSizeStyle = useMemo(() => {
        if (settings.pageSize === "A4") {
            return {
                width: "210mm",
                minHeight: "297mm",
                padding: "10mm",
                boxShadow: "0 0 3px rgba(0,0,0,0.2)",
            };
        } else {
            return {
                width: "215.9mm",
                minHeight: "279.4mm",
                padding: "10mm",
                boxShadow: "0 0 3px rgba(0,0,0,0.2)",
            };
        }
    }, [settings.pageSize]);

    // ✅ ترتيب الأقسام حسب الـ order
    const sortedSections = useMemo(() => {
        if (!sections || sections.length === 0) return [];
        return [...sections].sort((a, b) => {
            const orderA = distribution[a.id]?.order ?? Infinity;
            const orderB = distribution[b.id]?.order ?? Infinity;
            return orderA - orderB;
        });
    }, [sections, distribution]);

    // ✅ دالة لعرض القسم
    const renderSection = (section: Section) => {
        const hasList = section.schema.children?.some(child => child.tag === 'ul' || child.tag === 'ol') || false;
        
        const handleAddNode = (parentId: string) => {
            console.log('🟢 BuildLayout handleAddNode - sectionId:', section.id, 'parentId:', parentId);
            if (onNodeAdd) {
                onNodeAdd(section.id, parentId);
            }
        };
        
        return (
            <div key={section.id} className="section-wrapper mb-6 last:mb-0 border border-gray-200 rounded-lg overflow-hidden">
                {isEditable && (
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                📁 {section.name}
                            </span>
                            {hasList && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    + Add
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400">
                            {section.id.substring(0, 8)}...
                        </span>
                    </div>
                )}
                
                <div className="p-4">
                    <NodeRenderer
                        node={section.schema}
                        sectionId={section.id}
                        content={content}
                        isEditable={isEditable}
                        onUpdate={(nodeId, value, props) => onNodeUpdate?.(section.id, nodeId, value, props)}
                        onAddNode={handleAddNode}
                        onDeleteNode={(nodeId) => onNodeDelete?.(section.id, nodeId)}
                        onSelectNode={onNodeSelect}
                        isSelected={selectedNodeId === section.id}
                        showActions={isEditable && hasList}
                    />
                </div>
            </div>
        );
    };

    if (!sections || sections.length === 0) {
        return (
            <div style={pageSizeStyle} id="resume">
                <p style={{ color: '#9ca3af', textAlign: 'center' }}>No sections available</p>
            </div>
        );
    }

    // ✅ تخطيط عمود واحد
    if (settings.columns === "ONE") {
        return (
            <div dir={settings.direction} style={pageSizeStyle} id="resume">
                <div className="main">
                    {sortedSections.map(renderSection)}
                </div>
            </div>
        );
    }

    // ✅ تخطيط عمودين - تصحيح المنطق
    const leftSections = sortedSections.filter(section => {
        const config = distribution[section.id];
        return config && config.position === "left";
    });

    const rightSections = sortedSections.filter(section => {
        const config = distribution[section.id];
        return config && config.position === "right";
    });

    const fullSections = sortedSections.filter(section => {
        const config = distribution[section.id];
        return config && config.position === "FULL";
    });

    const sidebarLeft = settings.sidebar?.position === "LEFT";

    // ✅ إذا كان الشريط الجانبي يسار، الأقسام اليسرى في العمود الأول
    if (sidebarLeft) {
        return (
            <div dir={settings.direction} style={pageSizeStyle} id="resume">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
                    <div className="left-side">
                        {/* ✅ الأقسام التي position = left تذهب للعمود الأول */}
                        {leftSections.map(renderSection)}
                        {/* ✅ الأقسام التي position = FULL تذهب للعمود الأول أيضاً */}
                        {fullSections.map(renderSection)}
                    </div>
                    <div className="right-side">
                        {/* ✅ الأقسام التي position = right تذهب للعمود الثاني */}
                        {rightSections.map(renderSection)}
                    </div>
                </div>
            </div>
        );
    }

    // ✅ إذا كان الشريط الجانبي يمين
    return (
        <div dir={settings.direction} style={pageSizeStyle} id="resume">
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                <div className="left-side">
                    {/* ✅ الأقسام التي position = left تذهب للعمود الأول */}
                    {leftSections.map(renderSection)}
                    {/* ✅ الأقسام التي position = FULL تذهب للعمود الأول أيضاً */}
                    {fullSections.map(renderSection)}
                </div>
                <div className="right-side">
                    {/* ✅ الأقسام التي position = right تذهب للعمود الثاني */}
                    {rightSections.map(renderSection)}
                </div>
            </div>
        </div>
    );
}