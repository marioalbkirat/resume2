// D:\cvBuilder\resumebuilder\src\hooks\sectionBuilder\componenets\AIGenerateModal.tsx
import { useState } from 'react';
import Swal from 'sweetalert2';
import { AISectionGenerator } from '@/classes/section/AISectionGenerator';
import { useSectionBuilder } from '../useSectionBuilder';

interface AIGenerateModalProps { 
    builder: ReturnType<typeof useSectionBuilder>; 
    onClose?: () => void; 
    sectionName: string;
    onGenerated?: () => void;
}

export default function AIGenerateModal({ builder, onClose, sectionName, onGenerated }: AIGenerateModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');
    const generator = new AISectionGenerator();

    const handleGenerate = async () => {
        if (!description.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please describe your section',
                text: 'Enter a description of the section you want to create.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await generator.generateSection({
                description: description.trim(),
                sectionType: "resume",
                additionalRequirements: `Return target RESUME and use this exact section name: ${sectionName}.`,
            });
            
            // التأكد من أن content هو Record وليس Array
            const contentRecord = result.content instanceof Array 
                ? Object.fromEntries(result.content.map(item => [item.id, item]))
                : result.content;

            builder.resetBuilder({ ...result.schema, name: sectionName }, contentRecord);
            onGenerated?.();
            
            Swal.fire({
                icon: 'success',
                title: 'Section Generated!',
                text: result.explanation || 'Your section has been created successfully.',
            });
            onClose?.();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Generation Failed',
                text: error instanceof Error ? error.message : 'Something went wrong.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-3xl">🤖</span>
                        AI Section Generator
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <span className="text-2xl">×</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Describe your section and fields *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Example: Create a professional experience section with 3 job entries, each containing company name, position, dates, and a list of achievements..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-32"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin">⚙️</span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <span>🚀</span>
                                    Generate Section
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 flex items-center gap-2">
                            <span>💡</span>
                            <span>Example: Create a skills section with categories: Programming Languages, Frameworks, and Tools, each with a list of items.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}