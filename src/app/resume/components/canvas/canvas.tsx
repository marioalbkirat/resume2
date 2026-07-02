"use client";

import { useResumeBuilder } from "@/context/resume/ResumeContext";
import BuildLayout from "@/hooks/Canava/BuildLayout";

export default function Canava() {
    const { sections, settings, distribution, content } = useResumeBuilder();

    if (!settings) return <div>Loading resume canvas...</div>;

    return (
        <BuildLayout
            settings={settings}
            distribution={distribution}
            sections={sections}
            content={content}
            mode="preview"
        />
    );
}
