import { ReactNode } from "react";
import { ResumeBuilderProvider } from "@/context/resume/ResumeContext";
import { SectionServicesProvider } from "@/context/section/SectionServicesContext";
export default function Layout({ children }: { children: ReactNode; }) {
    return <ResumeBuilderProvider>
        <SectionServicesProvider>
            {children}
        </SectionServicesProvider>
    </ResumeBuilderProvider>
}