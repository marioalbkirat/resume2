"use client";

import { useState, useEffect } from "react";
import { ALL_ICONS, searchIcons, IconItem } from "./index";

interface IconSelectorProps {
    onSelect: (icon: IconItem) => void;
    selectedIcon?: IconItem | null;
    className?: string;
}

export default function IconSelector({ onSelect, selectedIcon, className = "" }: IconSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredIcons, setFilteredIcons] = useState<IconItem[]>(ALL_ICONS);

    useEffect(() => {
        setFilteredIcons(searchIcons(searchTerm));
    }, [searchTerm]);

    const SelectedComponent = selectedIcon?.component;

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    {SelectedComponent ? (
                        <SelectedComponent className="w-5 h-5 text-gray-700" />
                    ) : (
                        <div className="w-5 h-5 bg-gray-200 rounded" />
                    )}
                    <span>{selectedIcon?.displayName || "Select an icon"}</span>
                </div>
                <span>{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg">
                    <div className="p-3 border-b">
                        <input
                            type="text"
                            placeholder="Search icons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-6 gap-2 p-3 max-h-64 overflow-y-auto">
                        {filteredIcons.map((icon) => {
                            const IconComponent = icon.component;
                            return (
                                <button
                                    key={icon.name}
                                    onClick={() => {
                                        onSelect(icon);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-center transition-colors group"
                                    title={icon.name}
                                >
                                    <IconComponent className="w-6 h-6 mx-auto text-gray-700 group-hover:text-blue-600" />
                                    <span className="text-xs mt-1 block truncate">{icon.displayName}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-2 border-t text-xs text-center text-gray-500">
                        {filteredIcons.length} icons available
                    </div>
                </div>
            )}
        </div>
    );
}