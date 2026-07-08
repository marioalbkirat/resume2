import Canava from "@/hooks/Canava/canava";
import ResumeHeader from "./components/header/header";
import ResumeWorkSpace from "./components/workSpace/workSpace";

export default function Page() {
    return (
        <main id="resume-page" className="min-h-screen overflow-x-hidden bg-slate-100">
            <ResumeHeader />
            <div id="resume-content" className="flex w-full max-w-full flex-col gap-4 overflow-hidden px-3 py-4 lg:flex-row lg:px-0 lg:py-5">
                <div className="min-w-0 flex-1">
                    <ResumeWorkSpace />
                </div>
                <div className="flex w-full min-w-0 justify-center overflow-auto px-0 pb-4 lg:w-[calc(215.9mm+2rem)] lg:shrink-0 lg:px-4">
                    <Canava />
                </div>
            </div>
        </main>
    );
}
