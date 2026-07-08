import { useState } from "react";
import ResumeCardWorkspace from "@/app/resume/components/cards/ResumeCardWorkspace";
import TemplatesFilter from "./templates/filter";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { ResumeTemplate } from "@/types/resume/ResumeTemplate";

export default function TemplatesPanel() {
    const { templates, selectedResume, activateTemplate, deletePrivateTemplate, setTemplates } = useResumeBuilder();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [activeSource, setActiveSource] = useState<"OFFICIAL" | "COMMUNITY" | "PRIVATE">("OFFICIAL");

    const categories = [
        { id: "all", label: "All Templates", icon: "🎨", count: templates.length },
        { id: "ATS", label: "ATS", icon: "📊", count: templates.filter(t => t.category === "ATS").length },
        { id: "REGULAR", label: "REGULAR", icon: "📄", count: templates.filter(t => t.category === "REGULAR").length },
    ];

    const sourceCounts = {
        OFFICIAL: templates.filter(t => t.visibility === "OFFICIAL").length,
        COMMUNITY: templates.filter(t => t.visibility === "COMMUNITY").length,
        PRIVATE: templates.filter(t => t.visibility === "PRIVATE").length,
    };

    const getTemplatesBySource = (): ResumeTemplate[] => {
        if (activeSource === "OFFICIAL") return templates.filter(t => t.visibility === "OFFICIAL");
        if (activeSource === "COMMUNITY") return templates.filter(t => t.visibility === "COMMUNITY");
        return templates.filter(t => t.visibility === "PRIVATE");
    };

    const filteredTemplates = getTemplatesBySource().filter((template) => (activeCategory === "all" || template.category === activeCategory) && template.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelectTemplate = (id: string) => {
        const temp = templates.find(e => e.id === id);
        if (temp) activateTemplate(temp);
    };

    const handleToggleLike = async (id: string) => {
        const response = await fetch("/api/resume/template-like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateId: id }) });
        if (!response.ok) return;
        const result = await response.json() as { id: string; likes: number; isLiked: boolean };
        setTemplates(previous => previous.map(template => template.id === result.id ? { ...template, likes: result.likes, isLiked: result.isLiked } : template));
    };

    const handleDeletePrivateTemplate = async (id: string) => {
        const template = templates.find(item => item.id === id);
        if (!template || template.visibility !== "PRIVATE") return;
        const confirmed = window.confirm(`Delete private template "${template.name}"? This cannot be undone.`);
        if (!confirmed) return;
        await deletePrivateTemplate(id);
    };

    return (
        <div className="space-y-6">
            <TemplatesFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeSource={activeSource} setActiveSource={setActiveSource} categories={categories} sourceCounts={sourceCounts} getTemplatesBySource={getTemplatesBySource} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => <ResumeCardWorkspace key={template.id} id={template.id} name={template.name} previewImage={template.previewImage} forks={template.forks} downloads={template.downloads} likes={template.likes} isLiked={template.isLiked} isSelected={(selectedResume?.id ?? "") === template.id} authorName={template.visibility === "COMMUNITY" ? template.authorName : undefined} onClick={handleSelectTemplate} onLike={handleToggleLike} onDelete={template.visibility === "PRIVATE" ? handleDeletePrivateTemplate : undefined} />)}
            </div>
        </div>
    );
}
