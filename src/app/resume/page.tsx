import ResumeCanvas from "./components/canvas/canvas";
import ResumeHeader from "./components/header/header";
import ResumeWorkSpace from "./components/workSpace/workSpace";
export default function Page() {
    return <main id="resume-page">
        <ResumeHeader />
        <div id="resume-content" className="flex w-full max-w-full py-5 gap-4">
            <div className="felx-1"><ResumeWorkSpace /></div>
            <div style={{width:"217mm"}} className=" shrink-0"><ResumeCanvas /></div>
        </div>
    </main >
}