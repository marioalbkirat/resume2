// app/components/resume/cards/ResumeCardSEO.tsx
"use client";
import Image from "next/image";
import { FiEye, FiGitBranch, FiHeart, FiDownload } from "react-icons/fi";

interface ResumeCardSEOProps {
    id: string;
    name: string;
    previewImage?: string;
    forks: number;
    downloads: number;
    likes: number;
    onPreview: (id: string) => void;
}

export default function ResumeCardSEO({
    id,
    name,
    previewImage,
    forks,
    downloads,
    likes,
    onPreview
}: ResumeCardSEOProps) {
    const formatNumber = (num: number): string => {
        if (num >= 10000) return `${(num / 1000).toFixed(0)}k`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
            {/* Image Preview */}
            <div className="relative bg-linear-to-br from-gray-100 to-gray-200 aspect-3/4 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                    <Image
                        src={previewImage}
                        alt={name}
                        className="w-full h-full object-cover"
                        width={300}
                        height={200}
                    />
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Preview</p>
                    </div>
                )}

                {/* Preview Button - Eye Icon */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPreview(id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-50 cursor-pointer"
                    title="Preview Template"
                >
                    <FiEye className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Footer with Stats */}
            <div className="p-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <FiGitBranch className="w-3 h-3" /> {formatNumber(forks)}
                        </span>
                        <span className="flex items-center gap-1">
                            <FiHeart className="w-3 h-3" /> {formatNumber(likes)}
                        </span>
                        <span className="flex items-center gap-1">
                            <FiDownload className="w-3 h-3" /> {formatNumber(downloads)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}