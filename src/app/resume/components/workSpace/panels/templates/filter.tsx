import { ResumeTemplate } from "@/types/resume/ResumeTemplate";
import { FiStar, FiUsers } from "react-icons/fi";
import { RiGitRepositoryPrivateFill } from "react-icons/ri";
export default function TemplatesFilter({ searchTerm, setSearchTerm, activeCategory, setActiveCategory, activeSource, setActiveSource, categories, sourceCounts, getTemplatesBySource }: {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    activeSource: "OFFICIAL" | "COMMUNITY" | "PRIVATE";
    setActiveSource: (source: "OFFICIAL" | "COMMUNITY" | "PRIVATE") => void;
    categories: { id: string; label: string; icon: React.ReactNode; count: number }[];
    sourceCounts: Record<"OFFICIAL" | "COMMUNITY" | "PRIVATE", number>;
    getTemplatesBySource: () => ResumeTemplate[];
}) {
    const getCategoryCount = (categoryId: string) => {
        const templates = getTemplatesBySource();
        if (categoryId === "all") return templates.length;
        return templates.filter(t => t.category === categoryId).length;
    };
    return (
        <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <div className="flex-1 min-w-50">
                    <input
                        type="text"
                        placeholder="Search templates by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>
            <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200">
                {[
                    { id: "OFFICIAL", label: "Official Gallery", icon: <FiStar className="w-3 h-4" /> },
                    { id: "COMMUNITY", label: "Community Templates", icon: <FiUsers className="w-3 h-4" /> },
                    { id: "PRIVATE", label: "Private Templates", icon: <RiGitRepositoryPrivateFill className="w-3 h-4" /> },
                ].map((source) => (
                    <button
                        key={source.id}
                        onClick={() => setActiveSource(source.id as typeof activeSource)}
                        className={`flex shrink-0 items-center gap-2 rounded-t-lg px-3 py-3 text-sm font-medium transition-all cursor-pointer sm:text-base ${activeSource === source.id
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {source.icon}
                        {source.label}
                        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${activeSource === source.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                            {sourceCounts[source.id as keyof typeof sourceCounts]}
                        </span>
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${activeCategory === category.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        <span>{category.icon}</span>
                        {category.label}
                        <span className="ml-1 text-sm opacity-75">({getCategoryCount(category.id)})</span>
                    </button>
                ))}
            </div>
        </div>
    );
}