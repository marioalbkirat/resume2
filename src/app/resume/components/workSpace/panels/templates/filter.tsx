import { FiStar, FiUsers } from "react-icons/fi";
import { RiGitRepositoryPrivateFill } from "react-icons/ri";
export default function TemplatesFilter({ searchTerm, setSearchTerm, activeCategory, setActiveCategory, activeSource, setActiveSource, categories, getTemplatesBySource }: {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    activeSource: "OFFICIAL" | "COMMUNITY" | "PRIVATE";
    setActiveSource: (source: "OFFICIAL" | "COMMUNITY" | "PRIVATE") => void;
    categories: { id: string; label: string; icon: React.ReactNode; count: number }[];
    getTemplatesBySource: () => any[];
}) {
    const getCategoryCount = (categoryId: string) => {
        const templates = getTemplatesBySource();
        if (categoryId === "all") return templates.length;
        return templates.filter(t => t.category === categoryId).length;
    };
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
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
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[
                    { id: "OFFICIAL", label: "Official Gallery", icon: <FiStar className="w-3 h-4" /> },
                    { id: "COMMUNITY", label: "Community Templates", icon: <FiUsers className="w-3 h-4" /> },
                    { id: "PRIVATE", label: "Private Templates", icon: <RiGitRepositoryPrivateFill className="w-3 h-4" /> },
                ].map((source) => (
                    <button
                        key={source.id}
                        onClick={() => setActiveSource(source.id as typeof activeSource)}
                        className={`flex items-center gap-2 px-3 py-3 rounded-t-lg font-medium transition-all cursor-pointer ${activeSource === source.id
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {source.icon}
                        {source.label}
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