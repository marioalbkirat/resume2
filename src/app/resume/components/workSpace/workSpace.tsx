"use client";
import { useState } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import TemplatesPanel from "./panels/TemplatesPanel";
import SectionsPanel from "./panels/SectionsPanel";
import StylesPanel from "./panels/StylesPanel";
import AIToolsPanel from "./panels/AIToolsPanel";
import SettingsPanel from "./panels/SettingsPanel";
import DraftsPanel from "./panels/DraftsPanel";
export default function ResumeWorkSpace() {
    const { selectedResume } = useResumeBuilder();
    const [activeTab, setActiveTab] = useState<string>("templates");
    const tabs = [
        { id: "templates", label: "Templates", icon: "📄" },
        { id: "drafts", label: "Drafts", icon: "📝" },
        { id: "sections", label: "Sections", icon: "📑" },
        { id: "styles", label: "Styles", icon: "🎨" },
        { id: "ai-tools", label: "AI Tools", icon: "🤖" },
        { id: "settings", label: "Settings", icon: "⚙️" },
    ];
    const renderPanel = () => {
        switch (activeTab) {
            case "templates":
                return <TemplatesPanel />;
            case "drafts":
                return <DraftsPanel />;
            case "sections":
                return <SectionsPanel />;
            case "styles":
                return <StylesPanel key={selectedResume?.id ?? "blank-draft"} />;
            case "ai-tools":
                return <AIToolsPanel />;
            case "settings":
                return <SettingsPanel />;
            default:
                return <TemplatesPanel />;
        }
    };
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-xl p-1 shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="animate-fadeIn">{renderPanel()}</div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}