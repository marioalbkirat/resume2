import { SectionServicesProvider } from "@/context/section/SectionServicesContext";
import { ReactNode } from "react";
export default function Layout({ children }: { children: ReactNode; }) {
    return (
        <SectionServicesProvider>
            {children}
        </SectionServicesProvider>
    );
}