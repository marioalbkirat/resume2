"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Section } from "@/types/resume/Section";
import { SectionServices } from "@/classes/section/SectionServices";
import { CreateSection } from "@/classes/section";
type SectionServicesContextType = {
    getSections: () => Promise<Section[]>;
    createSection: (sectionForm: CreateSection) => Promise<void>;
    deleteSection: (id: string) => Promise<void>;
    getSectionById: (id: string) => Promise<Section>;
    updateSection: (id: string, section: CreateSection) => Promise<void>;
};
const SectionServicesContext = createContext<SectionServicesContextType | null>(null);
type ProviderProps = { children: ReactNode; };
export function SectionServicesProvider({ children }: ProviderProps) {
    const [services] = useState(() => new SectionServices());
    const getSections = async (): Promise<Section[]> => {
        return await services.getSections();
    };
    const createSection = async (sectionForm: CreateSection): Promise<void> => {
        return await services.createSection(sectionForm)
    };
    const deleteSection = async (id: string): Promise<void> => {
        return await services.deleteSection(id)
    };
    const getSectionById = async (id: string): Promise<Section> => {
        return await services.getSectionById(id)
    };
    const updateSection = async (id: string, sectionForm: CreateSection): Promise<void> => {
        return await services.updateSection(id, sectionForm);
    }
    return (
        <SectionServicesContext.Provider
            value={{
                updateSection,
                getSectionById,
                getSections,
                createSection,
                deleteSection
            }}
        >
            {children}
        </SectionServicesContext.Provider>
    );
}
export function useSectionServices() {
    const context = useContext(SectionServicesContext);
    if (!context) throw new Error("useSectionServices must be used inside SectionServicesProvider");
    return context;
}