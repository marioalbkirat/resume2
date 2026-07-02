import { useState } from "react";
import { useResumeBuilder } from "@/context/resume/ResumeContext";
import { FiSave, FiRefreshCw } from "react-icons/fi";
interface ColorScheme {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}
interface FontOption {
    id: string;
    name: string;
    className: string;
}
export default function StylesPanel() {
    const { style, setStyle } = useResumeBuilder();
    const [selectedColor, setSelectedColor] = useState<string>("modern");
    const [selectedFont, setSelectedFont] = useState<string>("inter");
    const [spacing, setSpacing] = useState<number>(16);
    const [fontSize, setFontSize] = useState<number>(14);
    const colorSchemes: ColorScheme[] = [
        {
            id: "professional",
            name: "Professional Blue",
            primary: "#2563eb",
            secondary: "#3b82f6",
            accent: "#60a5fa",
            background: "#ffffff",
            text: "#1f2937",
        },
        {
            id: "modern",
            name: "Modern Purple",
            primary: "#7c3aed",
            secondary: "#8b5cf6",
            accent: "#a78bfa",
            background: "#faf5ff",
            text: "#4c1d95",
        },
        {
            id: "corporate",
            name: "Corporate Gray",
            primary: "#374151",
            secondary: "#4b5563",
            accent: "#6b7280",
            background: "#f9fafb",
            text: "#111827",
        },
        {
            id: "creative",
            name: "Creative Pink",
            primary: "#ec4899",
            secondary: "#f43f5e",
            accent: "#fb7185",
            background: "#fff1f2",
            text: "#9f1239",
        },
        {
            id: "dark",
            name: "Dark Mode",
            primary: "#3b82f6",
            secondary: "#60a5fa",
            accent: "#93c5fd",
            background: "#1e293b",
            text: "#f8fafc",
        },
    ];

    const fontOptions: FontOption[] = [
        { id: "inter", name: "Inter", className: "font-sans" },
        { id: "roboto", name: "Roboto", className: "font-roboto" },
        { id: "opensans", name: "Open Sans", className: "font-opensans" },
        { id: "lato", name: "Lato", className: "font-lato" },
        { id: "playfair", name: "Playfair Display", className: "font-playfair" },
    ];

    const currentColor = colorSchemes.find((c) => c.id === selectedColor)!;


    const applyStyles = () => setStyle((previous) => ({
        ...previous,
        global: {
            ...previous.global,
            "--resume-primary": currentColor.primary,
            "--resume-secondary": currentColor.secondary,
            "--resume-accent": currentColor.accent,
            backgroundColor: currentColor.background,
            color: currentColor.text,
            fontSize,
            lineHeight: `${spacing}px`,
        },
    }));

    const resetStyles = () => setStyle({ global: {}, selectors: {}, elements: {}, customCSS: "" });

    return (
        <div className="space-y-6">
            {/* Color Schemes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Schemes {Object.keys(style.global ?? {}).length > 0 && <span className="ml-2 text-xs font-normal text-blue-600">Template style loaded</span>}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {colorSchemes.map((scheme) => (
                        <button
                            key={scheme.id}
                            onClick={() => setSelectedColor(scheme.id)}
                            className={`p-4 rounded-xl transition-all cursor-pointer ${selectedColor === scheme.id
                                ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg"
                                : "hover:shadow-md"
                                }`}
                            style={{ backgroundColor: scheme.background }}
                        >
                            <div className="space-y-2">
                                <div className="flex gap-1">
                                    <div
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: scheme.primary }}
                                    />
                                    <div
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: scheme.secondary }}
                                    />
                                    <div
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: scheme.accent }}
                                    />
                                </div>
                                <p className="text-sm font-medium" style={{ color: scheme.text }}>
                                    {scheme.name}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {fontOptions.map((font) => (
                                <button
                                    key={font.id}
                                    onClick={() => setSelectedFont(font.id)}
                                    className={`p-3 rounded-lg border transition-all cursor-pointer ${selectedFont === font.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <p className={`${font.className} font-medium`}>{font.name}</p>
                                    <p className={`${font.className} text-xs text-gray-500 mt-1`}>
                                        The quick brown fox
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Font Size: {fontSize}px
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="20"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Line Spacing: {spacing}px
                        </label>
                        <input
                            type="range"
                            min="12"
                            max="32"
                            value={spacing}
                            onChange={(e) => setSpacing(parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                </div>
                <div
                    className="p-6 transition-all"
                    style={{
                        backgroundColor: currentColor.background,
                        color: currentColor.text,
                        fontSize: `${fontSize}px`,
                        lineHeight: `${spacing}px`,
                    }}
                >
                    <div className="space-y-4">
                        <h2
                            className="text-2xl font-bold"
                            style={{ color: currentColor.primary }}
                        >
                            John Doe
                        </h2>
                        <p className={fontOptions.find((f) => f.id === selectedFont)?.className}>
                            Experienced software developer with 5+ years of expertise in building
                            scalable web applications. Passionate about creating elegant solutions
                            to complex problems.
                        </p>
                        <div className="flex gap-4">
                            <div
                                className="px-4 py-2 rounded-lg text-white"
                                style={{ backgroundColor: currentColor.primary }}
                            >
                                View Portfolio
                            </div>
                            <div
                                className="px-4 py-2 rounded-lg"
                                style={{ backgroundColor: currentColor.secondary + "20", color: currentColor.secondary }}
                            >
                                Download CV
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex gap-4 justify-end">
                    <button onClick={resetStyles} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 cursor-pointer">
                        <FiRefreshCw className="w-4 h-4" />
                        Reset to Default
                    </button>
                    <button onClick={applyStyles} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 cursor-pointer">
                        <FiSave className="w-4 h-4" />
                        Apply Styles
                    </button>
                </div>
            </div>
        </div>
    );
}