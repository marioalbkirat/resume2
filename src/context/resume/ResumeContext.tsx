"use client";
import { Distribution } from "@/types/resume/Distribution";
import { ResumeTemplate } from "@/types/resume/ResumeTemplate";
import { Settings } from "@/types/resume/Settings";
import { createContext, useContext, ReactNode, useState, Dispatch, SetStateAction, useEffect } from "react";
type ResumeBuilderContextType = {
    setSelectedResume: Dispatch<SetStateAction<ResumeTemplate | null>>;
    selectedResume: ResumeTemplate | null
    templates: ResumeTemplate[],
    distribution: Distribution | null,
    settings: Settings | null,
    setDistribution: Dispatch<SetStateAction<Distribution | null>>;
    setSettings: Dispatch<SetStateAction<Settings>>;
};
const ResumeBuilderContext = createContext<ResumeBuilderContextType | null>(null);
type ProviderProps = { children: ReactNode; };
export function ResumeBuilderProvider({ children }: ProviderProps) {
    const [selectedResume, setSelectedResume] = useState<ResumeTemplate | null>(null);
    const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
    const [distribution, setDistribution] = useState<Distribution | null>(null);
    const [settings, setSettings] = useState<Settings>({
        fileName: "My_Resume",
        direction: "LTR",
        pageSize: "A4",
        showIcons: true,
        columns: "TWO",
        sidebar: { position: "LEFT" }
    });
    useEffect(() => {
        const fetchTemplates = async () => {
            const response = await fetch("/api/admin/templates");
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
                setSelectedResume(data[0]);
                const { settings, distribution } = data[0];
                setDistribution(distribution)
                setSettings(settings)
            }
        };
        fetchTemplates();
    }, []);
    return (
        <ResumeBuilderContext.Provider
            value={{
                selectedResume,
                setSelectedResume,
                templates,
                distribution,
                setDistribution,
                setSettings,
                settings
            }}
        >
            {children}
        </ResumeBuilderContext.Provider>
    );
}
export function useResumeBuilder() {
    const context = useContext(ResumeBuilderContext);
    if (!context) throw new Error("useResumeBuilder must be used inside ResumeBuilderProvider");
    return context;
}