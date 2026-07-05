"use client";
import Image from "next/image";
import { FiEye, FiHeart, FiDownload, FiTrash2 } from "react-icons/fi";
interface ResumeCardWorkspaceProps {
    id: string;
    name: string;
    previewImage?: string;
    views: number;
    downloads: number;
    likes: number;
    isSelected?: boolean;
    authorName?: string;
    onClick: (id: string) => void;
    onDelete?: (id: string) => void;
}
export default function ResumeCardWorkspace({
    id,
    name,
    previewImage,
    views,
    downloads,
    likes,
    isSelected = false,
    authorName,
    onClick,
    onDelete
}: ResumeCardWorkspaceProps) {
    const formatNumber = (num: number): string => {
        if (num >= 10000) return `${(num / 1000).toFixed(0)}k`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };
    return (
        <div onClick={() => onClick(id)}
            className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
                }`}
        >
            <div className="relative bg-linear-to-br from-gray-100 to-gray-200 aspect-3/4 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                    <Image fill src={previewImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">{name}</p>
                    </div>
                )}
            </div>
            <div className="px-3 pt-3 text-center">
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                    {name}
                </h4>
                {authorName && (
                    <p className="text-xs text-gray-500 mt-1">
                        by {authorName}
                    </p>
                )}
            </div>

            {/* Footer with Stats */}
            <div className="p-3 border-t border-gray-100 mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <FiEye className="w-3 h-3" /> {formatNumber(views)}
                        </span>
                        <span className="flex items-center gap-1">
                            <FiHeart className="w-3 h-3" /> {formatNumber(likes)}
                        </span>
                        <span className="flex items-center gap-1">
                            <FiDownload className="w-3 h-3" /> {formatNumber(downloads)}
                        </span>
                    </div>
                    {onDelete && (
                        <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(id); }} className="rounded-full p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700" title="Delete private template" aria-label={`Delete ${name}`}>
                            <FiTrash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}