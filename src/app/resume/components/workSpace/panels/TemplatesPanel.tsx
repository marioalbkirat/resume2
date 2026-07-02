import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import ResumeCardWorkspace from "@/app/resume/components/cards/ResumeCardWorkspace";
import { Visibility } from "@prisma/client";
import TemplatesFilter from "./templates/filter";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { ResumeTemplate } from "@/types/resume/ResumeTemplate";
export default function TemplatesPanel() {
    const { setSelectedResume, templates, selectedResume } = useResumeBuilder();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [activeSource, setActiveSource] = useState<Visibility>("OFFICIAL");
    const categories = [
        { id: "all", label: "All Templates", icon: "🎨", count: templates.length },
        { id: "ATS", label: "ATS", icon: "📊", count: templates.filter(t => t.category === "ATS").length },
        { id: "REGULAR", label: "REGULAR", icon: "📄", count: templates.filter(t => t.category === "REGULAR").length },
    ];
    const getTemplatesBySource = (): ResumeTemplate[] => {
        if (activeSource === "OFFICIAL") return [...templates.filter(t => t.visibility === "OFFICIAL")];
        if (activeSource === "COMMUNITY") return [...templates.filter(t => t.visibility === "COMMUNITY")];
        return [...templates.filter(t => t.visibility === "PRIVATE")];
    };
    const getFilteredTemplates = (): ResumeTemplate[] => {
        const templates = getTemplatesBySource();
        return templates.filter((template) => (activeCategory === "all" || template.category === activeCategory) && template.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    const filteredTemplates = getFilteredTemplates();
    const handleSelectTemplate = (id: string) => {
        if (id === "start-from-scratch") return;
        const temp = templates.find(e => e.id === id);
        if (temp) setSelectedResume(temp);
    };
    return (
        <div className="space-y-6">
            <TemplatesFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeSource={activeSource} setActiveSource={setActiveSource} categories={categories} getTemplatesBySource={getTemplatesBySource} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {/* <div
                    onClick={() => handleSelectTemplate("start-from-scratch")}
                    className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg overflow-hidden transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 border-2 border-dashed border-blue-300"
                >
                    <div className="relative bg-linear-to-br from-blue-100 to-purple-100 aspect-3/4 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <FiPlus className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Start From Scratch</h3>
                            <p className="text-gray-600 text-sm mt-2 px-4">
                                Create a completely blank resume and build it your way
                            </p>
                        </div>
                    </div>
                    <div className="px-3 pt-3 text-center">
                        <h4 className="font-semibold text-blue-600 text-sm">Blank Canvas</h4>
                        <p className="text-xs text-gray-500 mt-1">No templates, start fresh</p>
                    </div>
                    <div className="p-3 border-t border-gray-100 mt-2">
                        <div className="flex items-center justify-center text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <FiPlus className="w-3 h-3" /> Get Started
                            </span>
                        </div>
                    </div>
                </div> */}
                {filteredTemplates.map((template) => (
                    <ResumeCardWorkspace
                        key={template.id}
                        id={template.id}
                        name={template.name}
                        previewImage={template.previewImage}
                        views={template.views}
                        downloads={template.downloads}
                        likes={template.likes}
                        isSelected={(selectedResume?.id ?? "") === template.id || false}
                        authorName={template.visibility === "COMMUNITY" ? template.authorId : undefined}
                        onClick={handleSelectTemplate}
                    />
                ))}
            </div>
        </div>
    );
}