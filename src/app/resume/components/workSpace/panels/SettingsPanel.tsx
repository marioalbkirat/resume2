import { useResumeBuilder } from "@/context/resume/ResumeContext";
export default function SettingsPanel() {
    const { settings, setSettings } = useResumeBuilder();
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <label className="font-medium text-gray-900">show/hide icons</label>
                                <p className="text-sm text-gray-500 mt-1">Enable/disable icons</p>
                            </div>
                            <div className="ml-6">
                                <button onClick={() => setSettings(prev => ({ ...prev, showIcons: !prev.showIcons, }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings?.showIcons ? "bg-blue-600" : "bg-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings?.showIcons ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <label className="font-medium text-gray-900">Writing Direction</label>
                                <p className="text-sm text-gray-500 mt-1">Writing Direction</p>
                            </div>
                            <div className="ml-6">
                                <select
                                    value={settings?.direction}
                                    onChange={(e) => setSettings(prev => ({ ...prev, direction: e.target.value as "LTR" | "RTL", }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option key="LTR" value="LTR">LTR</option>
                                    <option key="RTL" value="RTL">RTL</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <label className="font-medium text-gray-900">Page Size</label>
                                <p className="text-sm text-gray-500 mt-1">Select the page size for your resume</p>
                            </div>
                            <div className="ml-6">
                                <select
                                    value={settings?.pageSize}
                                    onChange={(e) => setSettings(prev => ({ ...prev, pageSize: e.target.value as "A4" | "LETTER", }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option key="A4" value="A4">A4 (210 × 297mm)</option>
                                    <option key="LETTER" value="LETTER">Letter (8.5 × 11in)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <label className="font-medium text-gray-900">Page Size</label>
                                <p className="text-sm text-gray-500 mt-1">Select the page size for your resume</p>
                            </div>
                            <div className="ml-6">
                                <input
                                    type="text"
                                    value={settings?.fileName ?? "my_resume"}
                                    onChange={(e) => setSettings(prev => ({ ...prev, fileName: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}