import { useState } from "react";
import { FaRobot, FaMagic, FaPen, FaFileAlt, FaChartLine, FaLightbulb, FaRocket, FaCrown, FaCheckCircle, FaSpinner, FaTags, FaTachometerAlt, FaScroll, FaLanguage, FaPalette } from "react-icons/fa";
import { FiX, FiCopy, FiCheck } from "react-icons/fi";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { Content } from "@/types/resume/Content";
import { ResumeStyle } from "@/types/resume/ResumeStyle";

interface AIFeature {
    id: string;
    name: string;
    description: string;
    benefit: string;
    icon: React.ReactNode;
    color: string;
    category: "analysis" | "generation" | "translation" | "optimization" | "ats" | "design";
}
interface Suggestion {
    id: string;
    text: string;
    type: "keyword" | "action_verb" | "achievement" | "formatting";
}
type AnalysisResult = {
    score?: number;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    summary?: string;
    details?: string[];
    missingKeywords?: string[];
    issues?: string[];
    keywordPlan?: string[];
};

const styleSchema = `export interface StyleObject { [property: string]: string | number; } export interface ResumeStyle { global: StyleObject; selectors: Record<string, StyleObject>; elements: Record<string, StyleObject>; customCSS?: string; }`;

export default function AIToolsPanel() {
    const { content, sections, setContent, setStyle } = useResumeBuilder();
    const [jobDescription, setJobDescription] = useState<string>("");
    const [selectedText, setSelectedText] = useState("");
    const [skillArea, setSkillArea] = useState("");
    const [targetLanguage, setTargetLanguage] = useState("English");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeFeature, setActiveFeature] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [generatedContent, setGeneratedContent] = useState("");
    const [pendingContent, setPendingContent] = useState<Record<string, Content> | null>(null);
    const [pendingStyle, setPendingStyle] = useState<ResumeStyle | null>(null);
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const aiFeatures: AIFeature[] = [
        { id: "analyze", name: "Resume Analyzer", description: "Get AI-powered analysis of your resume against job descriptions", benefit: "Identifies strengths, gaps, and practical improvements before you apply.", icon: <FaChartLine className="w-6 h-6" />, color: "from-blue-500 to-blue-600", category: "analysis" },
        { id: "match-score", name: "ATS Match Score", description: "Calculate how well your resume matches a job posting", benefit: "Shows a realistic ATS compatibility score with missing keyword context.", icon: <FaTachometerAlt className="w-6 h-6" />, color: "from-cyan-500 to-cyan-600", category: "ats" },
        { id: "keywords", name: "Keyword Extractor", description: "Extract important keywords from job descriptions", benefit: "Finds priority hard skills, soft skills, and role-specific terms to include naturally.", icon: <FaTags className="w-6 h-6" />, color: "from-indigo-500 to-indigo-600", category: "ats" },
        { id: "coverletter", name: "Cover Letter Generator", description: "Generate personalized cover letters instantly", benefit: "Creates a focused letter that connects your resume to the company and role.", icon: <FaFileAlt className="w-6 h-6" />, color: "from-green-500 to-green-600", category: "generation" },
        { id: "summary", name: "Resume Summarizer", description: "Create a powerful professional summary", benefit: "Turns your background into a concise recruiter-friendly opening statement.", icon: <FaScroll className="w-6 h-6" />, color: "from-emerald-500 to-emerald-600", category: "generation" },
        { id: "translation", name: "Resume Translation", description: "Translate resume content while preserving professional tone", benefit: "Translates resume wording while keeping names, dates, structure, and meaning intact.", icon: <FaLanguage className="w-6 h-6" />, color: "from-sky-500 to-blue-600", category: "translation" },
        { id: "design-resume", name: "Design Resume", description: "Generate a complete professional resume style object", benefit: "Produces ATS-readable typography, spacing, colors, selectors, and element styles.", icon: <FaPalette className="w-6 h-6" />, color: "from-fuchsia-500 to-rose-600", category: "design" },
        { id: "optimize", name: "Content Optimizer", description: "Improve your resume content with AI suggestions", benefit: "Rewrites the full content into stronger, complete, polished, and measurable resume text.", icon: <FaMagic className="w-6 h-6" />, color: "from-purple-500 to-purple-600", category: "optimization" },
        { id: "rewrite", name: "Bullet Point Rewriter", description: "Rewrite achievements with powerful action verbs", benefit: "Transforms weak bullets into concise, impact-oriented achievements.", icon: <FaPen className="w-6 h-6" />, color: "from-pink-500 to-pink-600", category: "optimization" },
        { id: "skills", name: "Skill Suggestions", description: "Get AI-powered skill recommendations", benefit: "Uses your skills section and target role to suggest relevant skills only.", icon: <FaLightbulb className="w-6 h-6" />, color: "from-amber-500 to-amber-600", category: "optimization" },
        { id: "ats-optimize", name: "ATS Optimization", description: "Optimize your resume for ATS systems", benefit: "Explains ATS issues, keyword strategy, section structure, and readability risks.", icon: <FaRobot className="w-6 h-6" />, color: "from-red-500 to-red-600", category: "ats" },
        { id: "targeted-resume", name: "Targeted Resume", description: "Tailor your resume to a specific job description", benefit: "Aligns your resume with the target role while preserving your real skills and experience.", icon: <FaRocket className="w-6 h-6" />, color: "from-violet-500 to-violet-600", category: "optimization" },
    ];
    const categories = [
        { id: "all", label: "All Tools", icon: <FaRobot className="w-4 h-4" /> },
        { id: "analysis", label: "Analysis", icon: <FaChartLine className="w-4 h-4" /> },
        { id: "generation", label: "Generation", icon: <FaFileAlt className="w-4 h-4" /> },
        { id: "translation", label: "Translation", icon: <FaLanguage className="w-4 h-4" /> },
        { id: "optimization", label: "Optimization", icon: <FaMagic className="w-4 h-4" /> },
        { id: "ats", label: "ATS Tools", icon: <FaTachometerAlt className="w-4 h-4" /> },
        { id: "design", label: "Design", icon: <FaPalette className="w-4 h-4" /> },
    ];
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const filteredFeatures = aiFeatures.filter(feature => activeCategory === "all" || feature.category === activeCategory);

    const resetResults = () => { setAnalysisResult(null); setSuggestions([]); setGeneratedContent(""); setPendingContent(null); setPendingStyle(null); setErrorMessage(""); };
    const textFrom = (result: Record<string, unknown>) => typeof result.content === "string" ? result.content : String(result.summary ?? result.explanation ?? "");
    const normalizeContentResult = (resultContent: unknown) => {
        if (!resultContent || typeof resultContent !== "object" || Array.isArray(resultContent)) return null;

        const entries = Object.entries(resultContent as Record<string, Partial<Content>>);
        if (!entries.length) return null;

        return entries.reduce<Record<string, Content>>((next, [key, value]) => {
            const current = content[key];
            const id = typeof value?.id === "string" ? value.id : current?.id ?? key;
            const type = typeof value?.type === "string" ? value.type : current?.type ?? "text";
            const nextValue = typeof value?.value === "string" ? value.value : current?.value ?? "";
            next[key] = { ...current, ...value, id, type, value: nextValue, prop: value?.prop ?? current?.prop };
            return next;
        }, {});
    };
    const summarizeContentChanges = (result: Record<string, unknown>, fallbackSummary: string) => [
        typeof result.summary === "string" ? result.summary : fallbackSummary,
        ...(((result.changes ?? result.suggestions) as unknown[]) ?? []).filter((item): item is string => typeof item === "string"),
    ].filter(Boolean).join("\n• ");
    const skillSectionIds = new Set(sections.filter(section => section.name.toLowerCase().includes("skill")).flatMap(section => {
        const ids: string[] = [];
        const collect = (node: { id: string; children?: { id: string; children?: unknown[] }[] }) => {
            ids.push(node.id);
            node.children?.forEach(child => collect(child as { id: string; children?: { id: string; children?: unknown[] }[] }));
        };
        collect(section.schema as { id: string; children?: { id: string; children?: unknown[] }[] });
        return ids;
    }));
    const skillsContent = Object.fromEntries(Object.entries(content).filter(([id]) => skillSectionIds.has(id)));

    const handleAnalyze = async () => {
        if (["analyze", "match-score", "keywords", "ats-optimize", "targeted-resume"].includes(activeFeature ?? "") && !jobDescription.trim()) {
            alert("Please enter a job description for this targeted AI tool.");
            return;
        }
        setIsAnalyzing(true);
        resetResults();
        try {
            const response = await fetch("/api/resume/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tool: activeFeature, jobDescription, content: activeFeature === "skills" ? skillsContent : content, selectedText, skillArea, targetLanguage, styleSchema }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error ?? "AI request failed.");

            if (["analyze", "match-score", "ats-optimize"].includes(activeFeature ?? "")) setAnalysisResult(result);
            else if (activeFeature === "keywords") setSuggestions([...(result.priorityKeywords ?? []), ...(result.keywords ?? [])].map((text: string, index: number) => ({ id: `${index}-${text}`, text, type: "keyword" })));
            else if (activeFeature === "skills") setSuggestions([...(result.prioritySkills ?? []), ...(result.skills ?? [])].map((text: string, index: number) => ({ id: `${index}-${text}`, text, type: "keyword" })));
            else if (["translation", "optimize", "targeted-resume"].includes(activeFeature ?? "")) {
                const normalizedContent = normalizeContentResult(result.content);
                if (normalizedContent) {
                    setGeneratedContent(summarizeContentChanges(result, activeFeature === "translation" ? `Translated resume content to ${targetLanguage}.` : "Updated resume content is ready to review."));
                    setPendingContent(normalizedContent);
                } else {
                    setGeneratedContent(textFrom(result));
                }
            }
            else if (activeFeature === "design-resume") { setGeneratedContent(result.explanation ?? "A complete resume style is ready to apply."); setPendingStyle(result.style ?? null); }
            else setGeneratedContent(textFrom(result));
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to run AI tool.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    const approveContent = () => { if (pendingContent) { setContent(pendingContent); setPendingContent(null); } };
    const approveStyle = () => { if (pendingStyle) { setStyle(pendingStyle); setPendingStyle(null); } };
    const copyToClipboard = () => { navigator.clipboard.writeText(generatedContent); setCopied(true); };

    const renderAnalysis = () => analysisResult && <div className="space-y-4 mt-6">
        {typeof analysisResult.score === "number" && <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"><span className="font-semibold text-gray-900">Score</span><span className="text-3xl font-bold text-blue-600">{analysisResult.score}%</span></div>}
        {analysisResult.summary && <p className="text-sm text-gray-700 rounded-lg bg-gray-50 p-4">{analysisResult.summary}</p>}
        {(["strengths", "weaknesses", "recommendations", "details", "missingKeywords", "issues", "keywordPlan"] as const).map(key => analysisResult[key]?.length ? <div key={key}><h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FaCheckCircle className="text-green-600" /> {key.replace(/([A-Z])/g, " $1")}</h4><ul className="space-y-1">{analysisResult[key]?.map((item, index) => <li key={index} className="text-sm text-gray-700">• {item}</li>)}</ul></div> : null)}
    </div>;

    const renderGenerated = (approveLabel?: string, approveAction?: () => void) => generatedContent && <div className="relative space-y-3"><div className="p-4 bg-gray-50 rounded-lg border border-gray-200"><pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{generatedContent}</pre></div><button onClick={copyToClipboard} className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer">{copied ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4 text-gray-600" />}</button>{approveLabel && <button onClick={approveAction} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">{approveLabel}</button>}</div>;

    return <div className="space-y-6">
        <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white"><div className="flex items-center gap-3"><FaRobot className="w-8 h-8" /><h2 className="text-xl font-bold">AI Assistant Workspace</h2></div></div>
        <div className="bg-white rounded-xl shadow-lg p-4"><div className="flex flex-wrap gap-2">{categories.map(category => <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`flex items-center gap-2 px-2 py-2 rounded-lg font-medium transition-all cursor-pointer ${activeCategory === category.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{category.icon}{category.label}</button>)}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredFeatures.map(feature => <div key={feature.id} className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${activeFeature === feature.id ? "ring-2 ring-blue-500" : ""}`} onClick={() => { setActiveFeature(feature.id); resetResults(); }}><div className={`bg-linear-to-r ${feature.color} p-4`}><div className="text-white">{feature.icon}</div></div><div className="p-4"><h3 className="font-semibold text-gray-900 mb-1">{feature.name}</h3><p className="text-sm text-gray-600">{feature.description}</p><p className="mt-3 text-sm leading-6 text-gray-700 border-t border-gray-100 pt-3">{feature.benefit}</p><span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">{feature.category}</span></div></div>)}</div>
        {activeFeature && <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn"><div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between"><div className="flex items-center gap-3"><div className="text-2xl">{aiFeatures.find(f => f.id === activeFeature)?.icon}</div><div><h3 className="text-lg font-semibold text-gray-900">{aiFeatures.find(f => f.id === activeFeature)?.name}</h3><p className="text-sm text-gray-600">{aiFeatures.find(f => f.id === activeFeature)?.description}</p></div></div><button onClick={() => { setActiveFeature(null); resetResults(); }} className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"><FiX className="w-5 h-5 text-gray-500" /></button></div><div className="p-6 space-y-4">
            {errorMessage && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>}
            {["analyze", "match-score", "keywords", "ats-optimize", "targeted-resume"].includes(activeFeature) && <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the target job description here..." className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />}
            {activeFeature === "rewrite" && <textarea placeholder="Paste a bullet point or sentence you want to improve..." className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" value={selectedText} onChange={e => setSelectedText(e.target.value)} />}
            {activeFeature === "coverletter" && <textarea placeholder="Add company, role, and any extra context for the cover letter..." className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" value={selectedText} onChange={e => setSelectedText(e.target.value)} />}
            {activeFeature === "skills" && <input type="text" placeholder="Enter your target job title or industry" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={skillArea} onChange={e => setSkillArea(e.target.value)} />}
            {activeFeature === "translation" && <input type="text" placeholder="Target language" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} />}
            <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium cursor-pointer flex items-center justify-center gap-2">{isAnalyzing && <FaSpinner className="w-5 h-5 animate-spin" />}{isAnalyzing ? "Processing..." : "Run AI Tool"}</button>
            {renderAnalysis()}
            {suggestions.length > 0 && <div className="space-y-3"><h4 className="font-semibold text-gray-900">AI Results</h4><div className="flex flex-wrap gap-2">{suggestions.map(suggestion => <span key={suggestion.id} className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700">{suggestion.text}</span>)}</div></div>}
            {renderGenerated(activeFeature === "translation" ? "Apply Translation" : activeFeature === "optimize" ? "Approve Optimization" : activeFeature === "targeted-resume" ? "Approve Suggestions" : activeFeature === "design-resume" ? "Apply Design" : undefined, activeFeature === "design-resume" ? approveStyle : approveContent)}
            {activeFeature === "analyze" && analysisResult?.recommendations?.length && <div className="pt-2"><h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FaCrown className="text-yellow-600" /> Best Next Step</h4><p className="text-sm text-gray-700">Use Targeted Resume after reviewing these recommendations to tailor the full resume to this job description.</p></div>}
        </div></div>}
    </div>;
}
