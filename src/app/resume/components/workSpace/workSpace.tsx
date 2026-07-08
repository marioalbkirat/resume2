"use client";
import { useState } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import TemplatesPanel from "./panels/TemplatesPanel";
import SectionsPanel from "./panels/SectionsPanel";
import StylesPanel from "./panels/StylesPanel";
import AIToolsPanel from "./panels/AIToolsPanel";
import SettingsPanel from "./panels/SettingsPanel";
import DraftsPanel from "./panels/DraftsPanel";
export default function ResumeWorkSpace() {
    const { selectedResume } = useResumeBuilder();
    const [activeTab, setActiveTab] = useState<string>("templates");
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
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
        <div className={`relative min-h-[55vh] rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 transition-all duration-300 lg:min-h-screen lg:rounded-none ${isWorkspaceOpen ? "" : "h-16 min-h-16 overflow-visible lg:h-auto lg:w-14 lg:min-h-screen"}`}>
            <button
                type="button"
                onClick={() => setIsWorkspaceOpen((current) => !current)}
                aria-label={isWorkspaceOpen ? "Close resume workspace" : "Open resume workspace"}
                title={isWorkspaceOpen ? "Close workspace" : "Open workspace"}
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer lg:right-0 lg:top-6 lg:h-11 lg:w-11 lg:translate-x-1/2"
            >
                {isWorkspaceOpen ? <FiChevronLeft className="h-6 w-6" /> : <FiChevronRight className="h-6 w-6" />}
            </button>
            {isWorkspaceOpen && (
                <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:py-8">
                    <div className="mb-5 flex gap-2 overflow-x-auto rounded-xl bg-white p-1 pr-14 shadow-sm sm:flex-wrap lg:mb-8 lg:pr-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-all cursor-pointer sm:text-base ${
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
            )}
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