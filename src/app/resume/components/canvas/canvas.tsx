"use client";

import { ResumeProvider } from "@/context/resume/sampleResumeContext";
import Canava from "@/hooks/Canava/canava";

export default function ResumeCanvas() {
    return (
        <ResumeProvider>
            <Canava />
        </ResumeProvider>
    );
}
