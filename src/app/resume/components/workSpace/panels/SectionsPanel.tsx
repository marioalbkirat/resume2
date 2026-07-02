"use client";
import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEye, FiEyeOff, FiCopy, FiFolder } from "react-icons/fi";
import { IoMdMove } from "react-icons/io";
import CreateSection from "./CreateSection";
import { useSectionServices } from "@/context/section/SectionServicesContext";
interface Section {
    id: string;
    name: string;
    visible: boolean;
    order: number;
    type: "standard" | "custom";
    icon: string;
    showIcon: boolean;
    structure?: any;
}
export default function SectionsPanel() {
    const { getSections } = useSectionServices();
    const [sectionsdb, setSectionsdb] = useState<{ id: string; name: string }[]>([]);
    useEffect(() => {
        const loadSections = async () => {
            const data = await getSections();
            setSectionsdb(
                data.map((r) => ({
                    id: r.id,
                    name: r.name,
                }))
            );
        };
        loadSections();
    }, []);
    const [sections, setSections] = useState<Section[]>([
        { id: "1", name: "Professional Summary", visible: true, order: 0, type: "standard", icon: "📝", showIcon: true },
        { id: "2", name: "Work Experience", visible: true, order: 1, type: "standard", icon: "💼", showIcon: true },
        { id: "3", name: "Education", visible: true, order: 2, type: "standard", icon: "🎓", showIcon: true },
        { id: "4", name: "Skills", visible: true, order: 3, type: "standard", icon: "⚡", showIcon: true },
        { id: "5", name: "Projects", visible: true, order: 4, type: "standard", icon: "🚀", showIcon: true },
        { id: "6", name: "Certifications", visible: true, order: 5, type: "standard", icon: "📜", showIcon: true },
        { id: "7", name: "Languages", visible: true, order: 6, type: "standard", icon: "🌐", showIcon: true },
        { id: "8", name: "Achievements", visible: true, order: 7, type: "standard", icon: "🏆", showIcon: true },
    ]);
    const [newSectionName, setNewSectionName] = useState("");
    const [draggedSection, setDraggedSection] = useState<string | null>(null);
    const [showCreateSection, setShowCreateSection] = useState(false);
    const presetSections = [
        { name: "Personal Information", icon: "👤" },
        { name: "Contact Details", icon: "📞" },
        { name: "Professional Summary", icon: "📝" },
        { name: "Work Experience", icon: "💼" },
        { name: "Projects", icon: "🚀" },
        { name: "Education", icon: "🎓" },
        { name: "Certifications", icon: "📜" },
        { name: "Technical Skills", icon: "⚡" },
        { name: "Soft Skills", icon: "🤝" },
        { name: "Languages", icon: "🌐" },
        { name: "Achievements", icon: "🏆" },
        { name: "Volunteer Work", icon: "🤝" },
        { name: "Publications", icon: "📚" },
        { name: "References", icon: "👥" },
        { name: "Hobbies & Interests", icon: "🎨" },
        { name: "Awards", icon: "🏅" },
    ];
    const toggleVisibility = (id: string) => {
        setSections(sections.map((section) => section.id === id ? { ...section, visible: !section.visible } : section));
    };
    const toggleSectionIcon = (id: string) => {
        setSections(sections.map((section) => section.id === id ? { ...section, showIcon: !section.showIcon } : section));
    };
    const duplicateSection = (id: string) => {
        const sectionToDuplicate = sections.find((s) => s.id === id);
        if (sectionToDuplicate) {
            const newSection: Section = {
                ...sectionToDuplicate,
                id: `${sectionToDuplicate.type}-${Date.now()}`,
                name: `${sectionToDuplicate.name} (Copy)`,
                order: sections.length,
                showIcon: sectionToDuplicate.showIcon,
                structure: sectionToDuplicate.structure ? { ...sectionToDuplicate.structure } : undefined,
            };
            setSections([...sections, newSection]);
        }
    };
    const deleteSection = (id: string) => {
        if (confirm("Are you sure you want to delete this section?")) setSections(sections.filter((section) => section.id !== id));
    };
    const handleCreateSection = (sectionData: any) => {
        const sectionKey = Object.keys(sectionData.sections)[0];
        const newSectionStruct = sectionData.sections[sectionKey];
        const newSection: Section = {
            id: `custom-${Date.now()}`,
            name: newSectionStruct.name,
            visible: true,
            order: sections.length,
            type: "custom",
            icon: "📌",
            showIcon: true,
            structure: sectionData
        };
        setSections([...sections, newSection]);
        setNewSectionName("");
    };
    const addPresetSection = (presetName: string, icon: string) => {
        const exists = sections.some(s => s.name === presetName);
        if (!exists) {
            const newSection: Section = {
                id: `preset-${Date.now()}`,
                name: presetName,
                visible: true,
                order: sections.length,
                type: "standard",
                icon: icon,
                showIcon: true,
            };
            setSections([...sections, newSection]);
        } else {
            alert(`${presetName} section already exists!`);
        }
    };
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedSection(id);
        e.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };
    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedSection || draggedSection === targetId) return;
        const draggedIndex = sections.findIndex((s) => s.id === draggedSection);
        const targetIndex = sections.findIndex((s) => s.id === targetId);
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const newSections = [...sections];
            const [draggedItem] = newSections.splice(draggedIndex, 1);
            newSections.splice(targetIndex, 0, draggedItem);
            const reorderedSections = newSections.map((section, index) => ({
                ...section,
                order: index,
            }));
            setSections(reorderedSections);
        }
        setDraggedSection(null);
    };
    const visibleCount = sections.filter(s => s.visible).length;
    const totalCount = sections.length;
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Section Manager</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {visibleCount} of {totalCount} sections visible
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiPlus className="w-5 h-5 text-blue-600" />
                    Add Custom Section
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="Enter section name (e.g., 'Volunteer Work', 'Publications')"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={() => {
                            if (newSectionName.trim()) {
                                setShowCreateSection(true);
                            } else {
                                alert("Please enter a section name");
                            }
                        }}
                        disabled={!newSectionName.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Section
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiPlus className="w-5 h-5 text-purple-600" />
                    Preset Sections Gallery
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {presetSections.map((preset, idx) => {
                        const exists = sections.some(s => s.name === preset.name);
                        return (
                            <button
                                key={idx}
                                onClick={() => addPresetSection(preset.name, preset.icon)}
                                disabled={exists}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${exists
                                    ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                                    : "hover:border-blue-300 hover:bg-blue-50 border-gray-200"
                                    }`}
                            >
                                <span className="text-xl">{preset.icon}</span>
                                <span className="text-sm text-left flex-1">{preset.name}</span>
                                {!exists && <FiPlus className="w-4 h-4 text-blue-600" />}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Resume Sections</h3>
                    <p className="text-sm text-gray-600 mt-1">Drag and drop to reorder sections</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {sections
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                            <div
                                key={section.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, section.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, section.id)}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-move"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <IoMdMove className="w-5 h-5 text-gray-400 cursor-grab" />
                                    {section.showIcon && (
                                        <span className="text-2xl">{section.icon}</span>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{section.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{section.type}</p>
                                        {section.structure && (
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <FiFolder className="w-3 h-3" />
                                                Custom structure
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleSectionIcon(section.id)}
                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer group"
                                        title={section.showIcon ? "Hide Icon" : "Show Icon"}
                                    >
                                        {section.showIcon ? (
                                            <FiEye className="w-4 h-4 text-blue-600" />
                                        ) : (
                                            <FiEyeOff className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => toggleVisibility(section.id)}
                                        className="p-2 hover:bg-green-50 rounded-lg transition-colors cursor-pointer group"
                                        title={section.visible ? "Hide Section" : "Show Section"}
                                    >
                                        {section.visible ? (
                                            <FiEye className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <FiEyeOff className="w-4 h-4 text-green-400 group-hover:text-green-600" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => duplicateSection(section.id)}
                                        className="p-2 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                        title="Duplicate Section"
                                    >
                                        <FiCopy className="w-4 h-4 text-purple-600" />
                                    </button>
                                    {section.type === "custom" && (
                                        <button
                                            onClick={() => deleteSection(section.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            title="Delete Section"
                                        >
                                            <FiTrash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            <CreateSection
                sectionName={newSectionName}
                isOpen={showCreateSection}
                onClose={() => {
                    setShowCreateSection(false);
                    setNewSectionName("");
                }}
                onSave={handleCreateSection}
            />
        </div>
    );
}