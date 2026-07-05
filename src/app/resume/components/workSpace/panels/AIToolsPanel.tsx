import { useState } from "react";
import { FaRobot, FaMagic, FaPen, FaFileAlt, FaChartLine, FaLightbulb, FaRocket, FaCrown, FaCheckCircle, FaSpinner, FaRegLightbulb, FaTags, FaTachometerAlt, FaScroll, FaLanguage, FaLayerGroup, FaPalette } from "react-icons/fa";
import { FiX, FiCopy, FiCheck } from "react-icons/fi";
interface AIFeature {
    id: string;
    name: string;
    description: string;
    benefit: string;
    icon: React.ReactNode;
    color: string;
    category: "analysis" | "generation" | "optimization" | "ats" | "design";
}
interface Suggestion {
    id: string;
    text: string;
    type: "keyword" | "action_verb" | "achievement" | "formatting";
    applied: boolean;
}
export default function AIToolsPanel() {
    const [jobDescription, setJobDescription] = useState<string>("");
    const [selectedText, setSelectedText] = useState("");
    const [skillArea, setSkillArea] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeFeature, setActiveFeature] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<{
        score: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    } | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [generatedContent, setGeneratedContent] = useState("");
    const [copied, setCopied] = useState(false);
    const aiFeatures: AIFeature[] = [
        {
            id: "analyze",
            name: "Resume Analyzer",
            description: "Get AI-powered analysis of your resume against job descriptions",
            benefit: "يفحص السيرة مقابل وصف الوظيفة ويعطيك نقاط القوة والضعف وخطوات التحسين قبل التقديم.",
            icon: <FaChartLine className="w-6 h-6" />,
            color: "from-blue-500 to-blue-600",
            category: "analysis",
        },
        {
            id: "match-score",
            name: "ATS Match Score",
            description: "Calculate how well your resume matches a job posting",
            benefit: "يعطي نسبة توافق واضحة مع أنظمة ATS حتى تعرف مدى جاهزية السيرة للوظيفة المستهدفة.",
            icon: <FaTachometerAlt className="w-6 h-6" />,
            color: "from-cyan-500 to-cyan-600",
            category: "ats",
        },
        {
            id: "keywords",
            name: "Keyword Extractor",
            description: "Extract important keywords from job descriptions",
            benefit: "يستخرج الكلمات المهمة من إعلان الوظيفة لإضافتها في المهارات والخبرات بطريقة طبيعية.",
            icon: <FaTags className="w-6 h-6" />,
            color: "from-indigo-500 to-indigo-600",
            category: "ats",
        },
        {
            id: "coverletter",
            name: "Cover Letter Generator",
            description: "Generate personalized cover letters instantly",
            benefit: "ينشئ خطاب تقديم مخصص حسب الشركة والدور بدل استخدام نص عام يقلل فرص القبول.",
            icon: <FaFileAlt className="w-6 h-6" />,
            color: "from-green-500 to-green-600",
            category: "generation",
        },
        {
            id: "summary",
            name: "Resume Summarizer",
            description: "Create a powerful professional summary",
            benefit: "يلخص خبرتك في مقدمة احترافية قصيرة تبرز قيمتك بسرعة لمسؤول التوظيف.",
            icon: <FaScroll className="w-6 h-6" />,
            color: "from-emerald-500 to-emerald-600",
            category: "generation",
        },

        {
            id: "translation",
            name: "Resume Translation",
            description: "Translate resume content while preserving professional tone",
            benefit: "يترجم السيرة للإنجليزية أو العربية أو لغة أخرى مع الحفاظ على المصطلحات المهنية والتنسيق المناسب.",
            icon: <FaLanguage className="w-6 h-6" />,
            color: "from-sky-500 to-blue-600",
            category: "generation",
        },
        {
            id: "generate-section",
            name: "Generate Section",
            description: "Create complete resume sections from a short prompt",
            benefit: "ينشئ قسماً كاملاً مثل المشاريع أو الخبرات أو الشهادات من وصف مختصر لتسريع بناء السيرة.",
            icon: <FaLayerGroup className="w-6 h-6" />,
            color: "from-teal-500 to-emerald-600",
            category: "generation",
        },
        {
            id: "design-resume",
            name: "Design Resume",
            description: "Suggest visual layouts, spacing, colors, and typography",
            benefit: "يساعدك في اختيار تصميم مناسب للمجال مع تحسين الألوان والمسافات والخطوط بدون التأثير على قراءة ATS.",
            icon: <FaPalette className="w-6 h-6" />,
            color: "from-fuchsia-500 to-rose-600",
            category: "design",
        },
        {
            id: "optimize",
            name: "Content Optimizer",
            description: "Improve your resume content with AI suggestions",
            benefit: "يحسن صياغة المحتوى ويقترح كلمات أقوى وإنجازات قابلة للقياس دون تغيير هويتك المهنية.",
            icon: <FaMagic className="w-6 h-6" />,
            color: "from-purple-500 to-purple-600",
            category: "optimization",
        },
        {
            id: "rewrite",
            name: "Bullet Point Rewriter",
            description: "Rewrite achievements with powerful action verbs",
            benefit: "يحوّل الجمل الضعيفة إلى نقاط إنجاز تبدأ بأفعال قوية وتوضح الأثر والنتيجة.",
            icon: <FaPen className="w-6 h-6" />,
            color: "from-pink-500 to-pink-600",
            category: "optimization",
        },
        {
            id: "skills",
            name: "Skill Suggestions",
            description: "Get AI-powered skill recommendations",
            benefit: "يقترح مهارات مرتبطة بالمسمى الوظيفي حتى لا تفوّت مهارات مطلوبة في السوق.",
            icon: <FaLightbulb className="w-6 h-6" />,
            color: "from-amber-500 to-amber-600",
            category: "optimization",
        },
        {
            id: "improve",
            name: "General Improvement",
            description: "Get general suggestions to enhance your resume",
            benefit: "يعطي مراجعة عامة للبنية والتنسيق والمحتوى عندما لا تكون لديك وظيفة محددة بعد.",
            icon: <FaRegLightbulb className="w-6 h-6" />,
            color: "from-yellow-500 to-orange-500",
            category: "optimization",
        },
        {
            id: "ats-optimize",
            name: "ATS Optimization",
            description: "Optimize your resume for ATS systems",
            benefit: "يركز على قابلية القراءة آلياً وترتيب الأقسام والكلمات المفتاحية لتقليل رفض الأنظمة.",
            icon: <FaRobot className="w-6 h-6" />,
            color: "from-red-500 to-red-600",
            category: "ats",
        },
        {
            id: "enhance",
            name: "AI Enhancement",
            description: "One-click AI enhancement for your entire resume",
            benefit: "يحسن السيرة كاملة بنقرة واحدة مع الحفاظ على الأقسام الأساسية ونبرة المحتوى.",
            icon: <FaRocket className="w-6 h-6" />,
            color: "from-violet-500 to-violet-600",
            category: "optimization",
        },
    ];
    const categories = [
        { id: "all", label: "All Tools", icon: <FaRobot className="w-4 h-4" /> },
        { id: "analysis", label: "Analysis", icon: <FaChartLine className="w-4 h-4" /> },
        { id: "generation", label: "Generation", icon: <FaFileAlt className="w-4 h-4" /> },
        { id: "optimization", label: "Optimization", icon: <FaMagic className="w-4 h-4" /> },
        { id: "ats", label: "ATS Tools", icon: <FaTachometerAlt className="w-4 h-4" /> },
        { id: "design", label: "Design", icon: <FaPalette className="w-4 h-4" /> },
    ];
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const filteredFeatures = aiFeatures.filter(
        feature => activeCategory === "all" || feature.category === activeCategory
    );
    const handleAnalyze = async () => {
        if (!jobDescription.trim() && activeFeature === "analyze") {
            alert("Please enter a job description for targeted analysis");
            return;
        }
        setIsAnalyzing(true);
        // const content = {
        //     header: {
        //         name: "Daniel Carter",
        //         position: "Full Stack Developer"
        //     },

        //     profile: {
        //         title: "Profile",
        //         summary:
        //             "Full-stack developer with hands-on experience building web applications using Angular for frontend and Java Spring Boot for backend services. Skilled in REST API development, database integration, and writing clean, maintainable code following software engineering best practices. Passionate about building scalable and secure web applications and collaborating in agile development teams."
        //     },

        //     education: {
        //         title: "Education",
        //         items: [
        //             {
        //                 university: "Technical University of Berlin",
        //                 major: "BSc in Computer Science",
        //                 date: "2019 - 2023"
        //             }
        //         ]
        //     },

        //     experience: {
        //         title: "Experience",
        //         items: [
        //             {
        //                 position: "Junior Full Stack Developer",
        //                 company: "Tech Solutions GmbH",
        //                 date: "2023 - Present",
        //                 description:
        //                     "Developed and maintained web applications using Angular and Spring Boot. Built RESTful APIs, integrated frontend with backend services, and worked with MySQL databases. Participated in Agile teams using Jira and Bitbucket."
        //             },
        //             {
        //                 position: "Software Engineering Intern",
        //                 company: "Digital Systems Lab",
        //                 date: "2022 - 2023",
        //                 description:
        //                     "Assisted in backend development using Java and Spring Boot. Worked on API development, debugging, and unit testing. Collaborated with senior developers on feature implementation."
        //             }
        //         ]
        //     },

        //     skills: {
        //         title: "Skills",
        //         items: [
        //             { name: "Java" },
        //             { name: "Spring Boot" },
        //             { name: "Angular" },
        //             { name: "TypeScript" },
        //             { name: "HTML5 / CSS3 / SCSS" },
        //             { name: "REST APIs" },
        //             { name: "MySQL / PostgreSQL" },
        //             { name: "Git / Bitbucket" },
        //             { name: "Jira" },
        //             { name: "Unit Testing (JUnit, Jasmine)" }
        //         ]
        //     },

        //     projects: {
        //         title: "Projects",
        //         items: [
        //             {
        //                 name: "Task Management System",
        //                 description:
        //                     "Full-stack web app using Angular and Spring Boot for managing tasks with authentication, role-based access, and REST API integration.",
        //                 tech: {
        //                     items: [
        //                         { name: "Angular" },
        //                         { name: "Spring Boot" },
        //                         { name: "MySQL" },
        //                         { name: "JWT Authentication" }
        //                     ]
        //                 }
        //             },
        //             {
        //                 name: "E-Commerce API",
        //                 description:
        //                     "Backend REST API built with Spring Boot for product management, orders, and user authentication.",
        //                 tech: {
        //                     items: [
        //                         { name: "Spring Boot" },
        //                         { name: "Hibernate" },
        //                         { name: "PostgreSQL" }
        //                     ]
        //                 }
        //             }
        //         ]
        //     },

        //     languages: {
        //         title: "Languages",
        //         items: [{ lang: "English", level: "Fluent" }]
        //     }
        // };
        // let tool: string = "";
        // if (activeFeature === "analyze") tool = "analyze";
        // else if (activeFeature === "keywords") tool = "keywords";
        // else if (activeFeature === "skills") tool = "skills";
        // else if (activeFeature === "coverletter") tool = "coverletter";
        // else if (activeFeature === "rewrite") tool = "rewrite";
        // else if (activeFeature === "summary") tool = "summary";
        // else if (activeFeature === "translation") tool = "translation";
        // const response = await fetch("/api/resume/ai", {
        //     method: "POST",
        //     body: JSON.stringify({ tool, jobDescription, content }),
        // });
        // if (response.ok) {
        //     const result = await response.json();
        //     setAnalysisResult({
        //         score: result.score,
        //         strengths: result.strengths,
        //         weaknesses: result.weaknesses,
        //         recommendations: result.recommendations,
        //     });
        // }

        setTimeout(() => {
            if (activeFeature === "analyze") {
                setAnalysisResult({
                    score: 72,
                    strengths: ["Strong technical skills", "Clear work history", "Good education background"],
                    weaknesses: ["Missing quantified achievements", "Weak action verbs", "Lacks keywords"],
                    recommendations: [
                        "Add numbers and metrics to your achievements",
                        "Use stronger action verbs like 'led', 'achieved', 'developed'",
                        "Include keywords from the job description"
                    ]
                });
            } else if (activeFeature === "keywords") {
                setSuggestions([
                    { id: "1", text: "Project Management", type: "keyword", applied: false },
                    { id: "2", text: "Agile Methodology", type: "keyword", applied: false },
                    { id: "3", text: "Cross-functional Leadership", type: "keyword", applied: false },
                    { id: "4", text: "Data Analysis", type: "keyword", applied: false },
                    { id: "5", text: "Strategic Planning", type: "keyword", applied: false },
                ]);
            } else if (activeFeature === "skills") {
                setSuggestions([
                    { id: "1", text: "Python", type: "keyword", applied: false },
                    { id: "2", text: "React.js", type: "keyword", applied: false },
                    { id: "3", text: "AWS Cloud", type: "keyword", applied: false },
                    { id: "4", text: "Team Leadership", type: "keyword", applied: false },
                ]);
            } else if (activeFeature === "rewrite") {
                setGeneratedContent("• Led a team of 5 developers to successfully deliver a $500K project 2 weeks ahead of schedule\n• Increased application performance by 40% through strategic code optimization\n• Implemented CI/CD pipeline reducing deployment time by 60%");
            } else if (activeFeature === "coverletter") {
                setGeneratedContent("Dear Hiring Manager,\n\nI am excited to apply for the position at your company. With over 5 years of experience in full-stack development, I have successfully delivered multiple high-impact projects...\n\n[Full cover letter content would be generated here]\n\nSincerely,\n[Your Name]");
            } else if (activeFeature === "translation") {
                setGeneratedContent("Professional resume translation preview:\n\n• Senior Frontend Developer → مطور واجهات أمامية أول\n• Built scalable dashboards → طوّرت لوحات تحكم قابلة للتوسع\n\n[Full translated resume content would appear here]");
            } else if (activeFeature === "generate-section") {
                setGeneratedContent("Projects\n\n• AI Resume Builder — Built a resume creation workspace with smart suggestions, ATS-friendly sections, and export-ready layouts.\n• Portfolio Dashboard — Developed a responsive dashboard to present projects, skills, and measurable achievements.");
            } else if (activeFeature === "design-resume") {
                setGeneratedContent("Design suggestions:\n\n• Use a clean two-column layout for contact details and skills.\n• Keep section headings bold with consistent spacing.\n• Choose one accent color and maintain high contrast for readability.\n• Avoid heavy graphics so the resume remains ATS-friendly.");
            } else if (activeFeature === "summary") {
                setGeneratedContent("Results-driven professional with 5+ years of experience in [Industry]. Proven track record of [key achievement]. Skilled in [top skills]. Passionate about [interests/values]. Seeking to leverage expertise at [Company Name] to drive [specific goals].");
            }
            setIsAnalyzing(false);
        }, 2000);
    };
    const applySuggestion = (id: string) => {
        setSuggestions(suggestions.map(s =>
            s.id === id ? { ...s, applied: !s.applied } : s
        ));
    };
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="space-y-6">
            <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3">
                    <FaRobot className="w-8 h-8" />
                    <div>
                        <h2 className="text-xl font-bold">AI Assistant Workspace</h2>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg font-medium transition-all cursor-pointer ${activeCategory === category.id
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {category.icon}
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatures.map((feature) => (
                    <div
                        key={feature.id}
                        className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${activeFeature === feature.id ? "ring-2 ring-blue-500" : ""
                            }`}
                        onClick={() => setActiveFeature(feature.id)}
                    >
                        <div className={`bg-linear-to-r ${feature.color} p-4`}>
                            <div className="text-white">{feature.icon}</div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">{feature.name}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                            <p className="mt-3 text-sm leading-6 text-gray-700 border-t border-gray-100 pt-3">
                                {feature.benefit}
                            </p>
                            <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                                {feature.category}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {activeFeature && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">
                                {aiFeatures.find(f => f.id === activeFeature)?.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {aiFeatures.find(f => f.id === activeFeature)?.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {aiFeatures.find(f => f.id === activeFeature)?.description}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setActiveFeature(null);
                                setAnalysisResult(null);
                                setSuggestions([]);
                                setGeneratedContent("");
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="p-6">
                        {activeFeature === "analyze" && (
                            <div className="space-y-6">
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here..."
                                    className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {isAnalyzing ? <FaSpinner className="w-5 h-5 animate-spin" /> : <FaChartLine className="w-5 h-5" />}
                                    {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
                                </button>

                                {analysisResult && (
                                    <div className="space-y-4 mt-6">
                                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                            <span className="font-semibold text-gray-900">Match Score</span>
                                            <span className="text-3xl font-bold text-blue-600">{analysisResult?.score}%</span>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-600" /> Strengths
                                            </h4>
                                            <ul className="space-y-1">
                                                {analysisResult?.strengths?.map((s: string, i: number) => (
                                                    <li key={i} className="text-sm text-gray-700">• {s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-600" /> weaknesses
                                            </h4>
                                            <ul className="space-y-1">
                                                {analysisResult?.weaknesses?.map((s: string, i: number) => (
                                                    <li key={i} className="text-sm text-gray-700">• {s}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <FaCrown className="text-yellow-600" /> Recommendations
                                            </h4>
                                            <ul className="space-y-1">
                                                {analysisResult?.recommendations?.map((r: string, i: number) => (
                                                    <li key={i} className="text-sm text-gray-700">• {r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeFeature === "match-score" && (
                            <div className="space-y-4">
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description to calculate ATS match score..."
                                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 font-medium cursor-pointer"
                                >
                                    {isAnalyzing ? "Calculating..." : "Calculate ATS Score"}
                                </button>
                            </div>
                        )}
                        {activeFeature === "keywords" && (
                            <div className="space-y-4">
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description to extract keywords..."
                                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium cursor-pointer"
                                >
                                    {isAnalyzing ? "Extracting..." : "Extract Keywords"}
                                </button>

                                {suggestions.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900">Keywords to Include</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion.id}
                                                    onClick={() => applySuggestion(suggestion.id)}
                                                    className={`px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer ${suggestion.applied
                                                        ? "bg-green-600 text-white"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {suggestion.applied && <FiCheck className="w-3 h-3 inline mr-1" />}
                                                    {suggestion.text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeFeature === "coverletter" && (
                            <div className="space-y-4">
                                <textarea
                                    placeholder="Tell us about the position, company, and your relevant experience..."
                                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    value={selectedText}
                                    onChange={(e) => setSelectedText(e.target.value)}
                                />
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium cursor-pointer"
                                >
                                    {isAnalyzing ? "Generating..." : "Generate Cover Letter"}
                                </button>
                                {generatedContent && (
                                    <div className="relative">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                                {generatedContent}
                                            </pre>
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                                        >
                                            {copied ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4 text-gray-600" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeFeature === "rewrite" && (
                            <div className="space-y-4">
                                <textarea
                                    placeholder="Paste a bullet point or sentence you want to improve..."
                                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    value={selectedText}
                                    onChange={(e) => setSelectedText(e.target.value)}
                                />
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 font-medium cursor-pointer"
                                >
                                    {isAnalyzing ? "Rewriting..." : "Rewrite with AI"}
                                </button>
                                {generatedContent && (
                                    <div className="relative">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                                {generatedContent}
                                            </pre>
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                                        >
                                            {copied ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4 text-gray-600" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeFeature === "skills" && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Enter your job title or industry (e.g., 'Frontend Developer')"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={skillArea}
                                    onChange={(e) => setSkillArea(e.target.value)}
                                />
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium cursor-pointer"
                                >
                                    {isAnalyzing ? "Generating..." : "Suggest Skills"}
                                </button>
                                {suggestions.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900">Recommended Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion.id}
                                                    onClick={() => applySuggestion(suggestion.id)}
                                                    className={`px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer ${suggestion.applied
                                                        ? "bg-green-600 text-white"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {suggestion.applied && <FiCheck className="w-3 h-3 inline mr-1" />}
                                                    {suggestion.text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {(activeFeature === "improve" || activeFeature === "optimize" ||
                            activeFeature === "ats-optimize" || activeFeature === "enhance" ||
                            activeFeature === "summary" || activeFeature === "translation" ||
                            activeFeature === "generate-section" || activeFeature === "design-resume") && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            {activeFeature === "improve" && "Get general suggestions to improve your resume structure, content, and formatting."}
                                            {activeFeature === "optimize" && "AI will analyze your resume and suggest improvements for action verbs, quantifiable achievements, and keyword optimization."}
                                            {activeFeature === "ats-optimize" && "Optimize your resume for Applicant Tracking Systems with formatting tips, keyword density analysis, and section organization."}
                                            {activeFeature === "enhance" && "One-click AI enhancement that improves your entire resume while preserving your original content structure."}
                                            {activeFeature === "summary" && "Create a compelling professional summary that captures attention and highlights your key qualifications."}
                                            {activeFeature === "translation" && "Translate resume content into the target language while keeping professional wording and resume formatting intact."}
                                            {activeFeature === "generate-section" && "Generate a complete resume section such as projects, achievements, certifications, or experience from a short instruction."}
                                            {activeFeature === "design-resume" && "Get visual design recommendations for layout, spacing, colors, and typography while keeping the resume readable and ATS-friendly."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium cursor-pointer"
                                    >
                                        {isAnalyzing ? "Processing..." : activeFeature === "translation" ? "Translate Resume" : activeFeature === "generate-section" ? "Generate Section" : activeFeature === "design-resume" ? "Suggest Design" : "Start Enhancement"}
                                    </button>
                                    {generatedContent && (
                                        <div className="relative">
                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                                    {generatedContent}
                                                </pre>
                                            </div>
                                            <button
                                                onClick={copyToClipboard}
                                                className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                                            >
                                                {copied ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4 text-gray-600" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}
