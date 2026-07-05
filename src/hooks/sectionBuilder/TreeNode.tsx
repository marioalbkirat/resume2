// D:\cvBuilder\resumebuilder\src\hooks\sectionBuilder\TreeNode.tsx
import { useState } from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import AddNode from "./componenets/AddNode";
import DeleteNode from "./componenets/DeleteNode";
import UpdateNode from "./componenets/UpdateNode";
import { Schema } from "@/types/resume/Section";
import { useSectionBuilder } from "./useSectionBuilder";

interface TreeNodeProps { 
    nodeId?: string; 
    level?: number; 
    isRoot?: boolean; 
    builder: ReturnType<typeof useSectionBuilder> 
}

const typeBadges: Record<string, { label: string; color: string; icon: string }> = {
    section: { label: "Section", color: "bg-purple-100 text-purple-700", icon: "📁" },
    heading: { label: "Heading", color: "bg-blue-100 text-blue-700", icon: "H" },
    text: { label: "Text", color: "bg-gray-100 text-gray-700", icon: "T" },
    paragraph: { label: "Para", color: "bg-gray-100 text-gray-700", icon: "¶" },
    link: { label: "Link", color: "bg-cyan-100 text-cyan-700", icon: "🔗" },
    image: { label: "Image", color: "bg-green-100 text-green-700", icon: "🖼" },
    date: { label: "Date", color: "bg-orange-100 text-orange-700", icon: "📅" },
    icon: { label: "Icon", color: "bg-yellow-100 text-yellow-700", icon: "⭐" },
    list: { label: "List", color: "bg-indigo-100 text-indigo-700", icon: "📋" },
    listItem: { label: "Item", color: "bg-indigo-100 text-indigo-700", icon: "•" },
};

export default function TreeNode({ nodeId, level = 0, isRoot = false, builder }: TreeNodeProps) {
    const { schema, getNode, allowedTagChildren, getContent } = builder;
    const currentNode: Schema | null = nodeId ? getNode(nodeId) : schema;
    const [isOpen, setIsOpen] = useState<boolean>(true);

    if (!currentNode) return null;

    const hasChildren = currentNode?.children && currentNode.children.length > 0;
    const allowedChildernTags = allowedTagChildren(currentNode.tag);
    const canHaveChildren: boolean = allowedChildernTags.length > 0;
    const badge = typeBadges[currentNode.type] || { label: currentNode.type, color: "bg-gray-100 text-gray-700", icon: "📄" };
    const content = getContent(currentNode.id);
    const displayValue = content?.value || '';

    return (
        <div className="relative">
            {level > 0 && (<div className="absolute border-l border-gray-200" style={{ left: `${level * 20 - 10}px`, top: 0, bottom: 0, height: '100%' }} />)}
            <div
                className={`group relative flex items-center gap-2 py-2 px-2 rounded-lg transition-all duration-200 cursor-pointer ${'border border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                style={{ marginLeft: `${level * 20}px` }}
            >
                <div className="flex items-center justify-center w-5 shrink-0">
                    {hasChildren && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-0.5 hover:bg-gray-200 rounded transition-colors text-gray-500 hover:text-gray-700"
                        >
                            {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                        </button>
                    )}
                </div>
                <div className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${badge.color} flex items-center gap-1`}>
                    <span className="text-xs">{badge.icon}</span>
                    <span>{badge.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-gray-400 font-mono shrink-0">📄</span>
                    <span className="text-sm font-medium text-gray-800 truncate">
                        {content?.prop?.title || currentNode.type}
                    </span>
                    {displayValue && (
                        <span className="text-xs text-gray-400 truncate ml-2">
                            = {displayValue.length > 30 ? displayValue.substring(0, 30) + '...' : displayValue}
                        </span>
                    )}
                </div>
                {currentNode.type === 'heading' && currentNode.tag && (
                    <div className="shrink-0 px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-500">
                        {currentNode.tag}
                    </div>
                )}
                <div className={`flex items-center gap-1 shrink-0 transition-all duration-200`}>
                    <div className="flex items-center gap-0.5 bg-white rounded-lg shadow-sm border border-gray-200 px-1 py-0.5">
                        {!["link", "image", "list", "listItem", "container", "section"].includes(currentNode.type) && <UpdateNode node={currentNode} builder={builder} />}
                        {!isRoot && <DeleteNode node={currentNode} builder={builder} />}
                        {canHaveChildren && <AddNode node={currentNode} builder={builder} />}
                    </div>
                </div>
            </div>
            {hasChildren && isOpen && (
                <div className="relative mt-1 ml-4">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" style={{ left: `${level * 20 + 10}px` }} />
                    {currentNode.children.map((child: Schema, index: number) => (
                        <div key={child.id} className="relative">
                            {index < currentNode.children.length - 1 && (
                                <div
                                    className="absolute border-l border-gray-200"
                                    style={{ left: `${(level + 1) * 20 - 10}px`, top: 0, bottom: 0 }}
                                />
                            )}
                            <TreeNode
                                key={child.id}
                                nodeId={child.id}
                                level={level + 1}
                                builder={builder}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}