"use client";;
import { useSectionServices } from "@/context/section/SectionServicesContext";
// import { CreateSection } from "@/classes/section";
import SectionBuilderUI from "@/hooks/sectionBuilder/SectionBuilderUI";
import { FiX, FiSave } from "react-icons/fi";
export interface CreateSectionProps {
    isOpen: boolean;
    sectionName: string;
    onClose: () => void;
    onSave: (sectionData: any) => void;
}
export default function CreateSection({ isOpen, onClose, sectionName }: CreateSectionProps) {
    const { createSection, section } = useSectionServices();
    const handleSave = async () => {
        // const sectionForm: CreateSection = { name: sectionName, visibility: "PRIVATE", target: "RESUME", schema: section };
        // await createSection(sectionForm);
    }
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">🏗️ Build Your Section</h3>
                            <p className="text-sm text-blue-100">Double-click any name to edit | Click + to add children</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <SectionBuilderUI sectionName={"sectionName"} />
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        <FiSave className="w-4 h-4" />
                        Create Section
                    </button>
                </div>
            </div>
        </div>
    );
}