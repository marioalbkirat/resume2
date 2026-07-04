import Canava from "@/hooks/Canava/canava";
import ResumeHeader from "./components/header/header";
import ResumeWorkSpace from "./components/workSpace/workSpace";

export default function Page() {
    return (
        <main id="resume-page" className="min-h-screen overflow-hidden">
            <ResumeHeader />
            <div id="resume-content" className="flex w-full max-w-full gap-4 overflow-hidden py-5">
                <div className="flex-1 min-w-0">
                    <ResumeWorkSpace />
                </div>
                <div className="flex w-[calc(215.9mm+2rem)] shrink-0 justify-center overflow-auto px-4 pb-4">
                    <Canava />
                </div>
            </div>
        </main>
    );
}
