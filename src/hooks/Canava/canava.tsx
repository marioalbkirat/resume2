// D:\cvBuilder\resumebuilder\src\hooks\Canava\Canava.tsx
"use client";
import { useSampleResume } from '@/context/resume/sampleResumeContext';
import BuildLayout from './BuildLayout';

interface CanavaProps {
    // لا حاجة لأي props
}

export default function Canava({}: CanavaProps) {
    const {
        sections,
        settings,
        distribution,
        content,
        mode,
        selectedNodeId,
        setSelectedNodeId,
        updateContent,
        addNode,
        deleteNode,
    } = useSampleResume();

    // ✅ دالة معالجة إضافة عقدة
    const handleAddNode = (sectionId: string, parentId: string) => {
        console.log('🟢 Canava handleAddNode - sectionId:', sectionId, 'parentId:', parentId);
        addNode(
            sectionId,
            'li',
            'listItem',
            `Item ${Date.now()}`,
            parentId,
            '',
            {}
        );
    };

    return (
        <div className="canava-container bg-white rounded-lg shadow-lg overflow-hidden">
            {/* ✅ فقط عرض المحتوى بدون toolbar */}
            <div className="canava-content p-4 bg-gray-50 min-h-[calc(100vh-200px)]">
                <BuildLayout
                    sections={sections}
                    settings={settings}
                    distribution={distribution}
                    content={content}
                    mode={mode}
                    selectedNodeId={selectedNodeId}
                    onNodeSelect={setSelectedNodeId}
                    onNodeUpdate={updateContent}
                    onNodeAdd={handleAddNode}
                    onNodeDelete={deleteNode}
                />
            </div>
        </div>
    );
}