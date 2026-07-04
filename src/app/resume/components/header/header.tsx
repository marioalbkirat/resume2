"use client";

import Link from "next/link";
import { FiDownload, FiUpload, FiSave, FiLink, FiGrid, FiFileText, FiEdit3, FiEye, FiLayers } from "react-icons/fi";
import { useResumeBuilder } from "@/context/resume/ResumeContext";

export default function ResumeHeader() {
    const { mode, setMode, pageCount } = useResumeBuilder();
    const isEdit = mode === "edit";

    return (
        <header id="resume-header" className="flex items-center justify-between px-6 py-3 bg-linear-to-r from-slate-50 to-blue-50/30 border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md"><FiFileText className="w-5 h-5 text-white" /></div>
                <div><h1 className="text-lg font-bold text-slate-800">Resume Builder</h1><p className="text-xs text-slate-500">Professional CV Manager</p></div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm" title="Current resume page count">
                    <FiLayers className="w-4 h-4" />
                    <span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
                </div>
                <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm" aria-label="Resume mode selector">
                    <button type="button" onClick={() => setMode("edit")} className={`cursor-pointer flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${isEdit ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`} aria-pressed={isEdit}><FiEdit3 className="w-4 h-4" />Edit</button>
                    <button type="button" onClick={() => setMode("preview")} className={`cursor-pointer flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${!isEdit ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`} aria-pressed={!isEdit}><FiEye className="w-4 h-4" />Preview</button>
                </div>
                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                <button className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 transition-all duration-200 bg-white rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:shadow-md border border-slate-200 group"><FiDownload className="w-4 h-4 group-hover:scale-110 transition-transform" />Export</button>
                <button className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 transition-all duration-200 bg-white rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:shadow-md border border-slate-200 group"><FiUpload className="w-4 h-4 group-hover:scale-110 transition-transform" />Import</button>
                <button className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg group"><FiSave className="w-4 h-4 group-hover:scale-110 transition-transform" />Save</button>
                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                <button className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-purple-700 transition-all duration-200 bg-purple-50 rounded-lg hover:bg-purple-100 hover:shadow-md border border-purple-200 group"><FiLink className="w-4 h-4 group-hover:scale-110 transition-transform" />Link Portfolio</button>
                <Link href="/dashboard" className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 transition-all duration-200 bg-white rounded-lg hover:bg-slate-50 hover:shadow-md border border-slate-200 group"><FiGrid className="w-4 h-4 group-hover:scale-110 transition-transform" />Dashboard</Link>
            </div>
        </header>
    );
}
