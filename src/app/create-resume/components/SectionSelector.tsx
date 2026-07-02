// import { Section } from '@/types/resume/Section';
// import { Engine, SectionDistribution } from '../page';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// interface SectionSelectorProps {
//     sections: Section[] | null;
//     engine: Engine;
//     setEngine: (e: any) => void;
// }
// const sectionIcons: { [key: string]: string } = {
//     contact: '📞',
//     profile: '👤',
//     experience: '💼',
//     education: '🎓',
//     skills: '⚡',
//     projects: '🚀',
//     certifications: '📜',
//     image: '📷',
//     header: '📌',
//     languages: '🌐',
//     achievements: '🏆',
//     volunteer: '🤝'
// };

// export default function SectionSelector({ setEngine, engine, sections }: SectionSelectorProps) {
//     // Helper: Get selected sections based on distribution keys (which are section names)
//     const getSelectedSections = (): Section[] => {
//         if (!sections) return [];
//         const distribution = engine.layout.distribution || {};
//         const selectedNames = Object.keys(distribution);
//         return sections.filter(section => selectedNames.includes(section.name));
//     };

//     // Helper: Get unselected sections
//     const getUnselectedSections = (): Section[] => {
//         if (!sections) return [];
//         const distribution = engine.layout.distribution || {};
//         const selectedNames = Object.keys(distribution);
//         return sections.filter(section => !selectedNames.includes(section.name));
//     };

//     const isTwoColumns = engine.layout.columns === "TWO";

//     const addSection = (section: Section) => {
//         const currentDistribution = { ...engine.layout.distribution };
        
//         // Check if section already exists using name as key
//         if (currentDistribution[section.name]) return;

//         const existingSections = getSelectedSections();
//         const newOrder = existingSections.length + 1;

//         // Determine default position based on column layout
//         const defaultPosition = isTwoColumns ? "right" : null;
        
//         const newDistribution: Record<string, SectionDistribution> = {
//             ...currentDistribution,
//             [section.name]: {
//                 order: newOrder,
//                 position: defaultPosition as "left" | "right" | null,
//                 visible: true,
//                 showIcon: engine.settings.showIcons
//             }
//         };

//         setEngine({
//             ...engine,
//             distribution: newDistribution
//         });
//     };

//     const removeSection = (sectionName: string) => {
//         const currentDistribution = { ...engine.layout.distribution };
//         delete currentDistribution[sectionName];

//         // Reorder remaining sections
//         const reorderedDistribution: Record<string, SectionDistribution> = {};
//         Object.keys(currentDistribution)
//             .sort((a, b) => currentDistribution[a].order - currentDistribution[b].order)
//             .forEach((name, index) => {
//                 reorderedDistribution[name] = {
//                     ...currentDistribution[name],
//                     order: index + 1
//                 };
//             });

//         setEngine({
//             ...engine,
//             distribution: reorderedDistribution
//         });
//     };

//     const onDragEnd = (result: any) => {
//         if (!result.destination) return;

//         const selectedSections = getSelectedSections();
//         const items = Array.from(selectedSections);
//         const [reorderedItem] = items.splice(result.source.index, 1);
//         items.splice(result.destination.index, 0, reorderedItem);

//         // Update distribution with new order using name as key
//         const newDistribution: Record<string, SectionDistribution> = {};
//         items.forEach((item, index) => {
//             newDistribution[item.name] = {
//                 ...engine.layout.distribution[item.name],
//                 order: index + 1
//             };
//         });

//         setEngine({
//             ...engine,
//             distribution: newDistribution
//         });
//     };

//     const updateSectionColumn = (sectionName: string, position: "left" | "right") => {
//         const currentDistribution = engine.layout.distribution || {};
//         setEngine({
//             ...engine,
//             distribution: {
//                 ...currentDistribution,
//                 [sectionName]: {
//                     ...currentDistribution[sectionName],
//                     position: position
//                 }
//             }
//         });
//     };

//     const toggleVisibility = (sectionName: string) => {
//         const currentDistribution = engine.layout.distribution || {};
//         const currentVisibility = currentDistribution[sectionName]?.visible ?? true;
        
//         setEngine({
//             ...engine,
//             distribution: {
//                 ...currentDistribution,
//                 [sectionName]: {
//                     ...currentDistribution[sectionName],
//                     visible: !currentVisibility
//                 }
//             }
//         });
//     };

//     const unselectedSections = getUnselectedSections();
//     const selectedSections = getSelectedSections().sort((a, b) => 
//         (engine.layout.distribution[a.name]?.order || 0) - (engine.layout.distribution[b.name]?.order || 0)
//     );

//     return (
//         <div className="space-y-4">
//             {/* Available Sections */}
//             <div>
//                 <h4 className="font-medium text-sm text-gray-700 mb-2">
//                     Available Sections ({unselectedSections.length})
//                 </h4>
//                 <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
//                     {unselectedSections.map((section) => (
//                         <button
//                             key={section.id}
//                             type="button"
//                             onClick={() => addSection(section)}
//                             className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all text-sm cursor-pointer"
//                         >
//                             <span className="text-base">{sectionIcons[section.name] || '📄'}</span>
//                             <span>{section.name}</span>
//                             <span className="text-blue-500 text-lg font-bold ml-1">+</span>
//                         </button>
//                     ))}
//                     {unselectedSections.length === 0 && (
//                         <div className="text-sm text-green-600 py-2 w-full text-center">
//                             ✓ All sections have been added
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Selected Sections */}
//             {selectedSections.length > 0 && (
//                 <div>
//                     <h4 className="font-medium text-sm text-gray-700 mb-2">
//                         Selected Sections ({selectedSections.length}) - Drag to reorder
//                     </h4>
//                     <DragDropContext onDragEnd={onDragEnd}>
//                         <Droppable droppableId="sections">
//                             {(provided) => (
//                                 <div
//                                     {...provided.droppableProps}
//                                     ref={provided.innerRef}
//                                     className="space-y-2 max-h-96 overflow-y-auto p-1"
//                                 >
//                                     {selectedSections.map((section, index) => {
//                                         const distribution = engine.layout.distribution[section.name];
//                                         const isVisible = distribution?.visible ?? true;
                                        
//                                         return (
//                                             <Draggable 
//                                                 key={section.id} 
//                                                 draggableId={section.name}  // Using name as draggableId
//                                                 index={index}
//                                             >
//                                                 {(provided, snapshot) => (
//                                                     <div
//                                                         ref={provided.innerRef}
//                                                         {...provided.draggableProps}
//                                                         className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
//                                                             snapshot.isDragging
//                                                                 ? 'border-blue-500 shadow-lg bg-blue-50'
//                                                                 : !isVisible
//                                                                 ? 'border-gray-300 bg-gray-50 opacity-60'
//                                                                 : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
//                                                         }`}
//                                                     >
//                                                         <div className="flex items-center gap-3 flex-1">
//                                                             <div
//                                                                 {...provided.dragHandleProps}
//                                                                 className="cursor-move text-gray-400 hover:text-gray-600 text-xl"
//                                                             >
//                                                                 ⋮⋮
//                                                             </div>
//                                                             <span className="text-xl">{sectionIcons[section.name] || '📄'}</span>
//                                                             <span className={`font-medium ${!isVisible ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
//                                                                 {section.name}
//                                                             </span>
//                                                             <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
//                                                                 #{distribution?.order || index + 1}
//                                                             </span>
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={() => toggleVisibility(section.name)}
//                                                                 className={`text-xs px-2 py-1 rounded transition ${
//                                                                     isVisible
//                                                                         ? 'text-green-600 hover:bg-green-50'
//                                                                         : 'text-gray-400 hover:bg-gray-200'
//                                                                 }`}
//                                                                 title={isVisible ? 'Hide section' : 'Show section'}
//                                                             >
//                                                                 {isVisible ? '👁️' : '🚫'}
//                                                             </button>
//                                                         </div>

//                                                         {isTwoColumns && (
//                                                             <div className="flex gap-2 mr-3">
//                                                                 <button
//                                                                     type="button"
//                                                                     onClick={() => updateSectionColumn(section.name, 'left')}
//                                                                     className={`px-3 py-1 text-xs font-medium rounded transition ${
//                                                                         distribution?.position === 'left'
//                                                                             ? 'bg-blue-500 text-white'
//                                                                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                                                                     }`}
//                                                                 >
//                                                                     Left
//                                                                 </button>
//                                                                 <button
//                                                                     type="button"
//                                                                     onClick={() => updateSectionColumn(section.name, 'right')}
//                                                                     className={`px-3 py-1 text-xs font-medium rounded transition ${
//                                                                         distribution?.position === 'right'
//                                                                             ? 'bg-blue-500 text-white'
//                                                                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                                                                     }`}
//                                                                 >
//                                                                     Right
//                                                                 </button>
//                                                             </div>
//                                                         )}

//                                                         <button
//                                                             type="button"
//                                                             onClick={() => removeSection(section.name)}
//                                                             className="ml-2 text-red-400 hover:text-red-600 text-xl leading-none font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 transition"
//                                                         >
//                                                             ×
//                                                         </button>
//                                                     </div>
//                                                 )}
//                                             </Draggable>
//                                         );
//                                     })}
//                                     {provided.placeholder}
//                                 </div>
//                             )}
//                         </Droppable>
//                     </DragDropContext>
//                 </div>
//             )}

//             {/* Statistics */}
//             {selectedSections.length > 0 && (
//                 <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
//                     <div className="flex justify-between items-center">
//                         <span>📊 Total: {selectedSections.length} sections</span>
//                         {isTwoColumns && (
//                             <div className="flex gap-4">
//                                 <span>📌 Left: {selectedSections.filter(s => engine.layout.distribution[s.name]?.position === 'left').length}</span>
//                                 <span>📌 Right: {selectedSections.filter(s => engine.layout.distribution[s.name]?.position === 'right').length}</span>
//                                 <span>👁️ Visible: {selectedSections.filter(s => engine.layout.distribution[s.name]?.visible !== false).length}</span>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Empty State */}
//             {selectedSections.length === 0 && (
//                 <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//                     <div className="text-4xl mb-2">📋</div>
//                     <p className="text-gray-500 text-sm font-medium">No sections selected yet</p>
//                     <p className="text-gray-400 text-xs mt-1">Click on any section above to add it to your resume</p>
//                     {isTwoColumns && (
//                         <p className="text-blue-500 text-xs mt-2">💡 Two-column mode: Sections will be added to the right column by default</p>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }
import { Section } from '@/types/resume/Section';
import { Engine, SectionDistribution } from '../page';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface SectionSelectorProps {
    sections: Section[] | null;
    engine: Engine;
    setEngine: (e: any) => void;
}

const sectionIcons: { [key: string]: string } = {
    contact: '📞',
    profile: '👤',
    experience: '💼',
    education: '🎓',
    skills: '⚡',
    projects: '🚀',
    certifications: '📜',
    image: '📷',
    header: '📌',
    languages: '🌐',
    achievements: '🏆',
    volunteer: '🤝'
};

export default function SectionSelector({ setEngine, engine, sections }: SectionSelectorProps) {
    // Helper: Get selected sections based on distribution keys (which are section names)
    const getSelectedSections = (): Section[] => {
        if (!sections) return [];
        const distribution = engine.layout.distribution || {};
        const selectedNames = Object.keys(distribution);
        return sections.filter(section => selectedNames.includes(section.name));
    };

    // Helper: Get unselected sections
    const getUnselectedSections = (): Section[] => {
        if (!sections) return [];
        const distribution = engine.layout.distribution || {};
        const selectedNames = Object.keys(distribution);
        return sections.filter(section => !selectedNames.includes(section.name));
    };

    const isTwoColumns = engine.layout.columns === "TWO";

    const addSection = (section: Section) => {
        const currentDistribution = { ...engine.layout.distribution };
        
        // Check if section already exists using name as key
        if (currentDistribution[section.name]) return;

        const existingSections = getSelectedSections();
        const newOrder = existingSections.length + 1;

        // Determine default position based on column layout
        const defaultPosition = isTwoColumns ? "right" : null;
        
        const newDistribution: Record<string, SectionDistribution> = {
            ...currentDistribution,
            [section.name]: {
                order: newOrder,
                position: defaultPosition as "left" | "right" | null,
                visible: true,
                showIcon: engine.settings.showIcons
            }
        };

        setEngine({
            ...engine,
            layout: {
                ...engine.layout,
                distribution: newDistribution
            }
        });
    };

    const removeSection = (sectionName: string) => {
        const currentDistribution = { ...engine.layout.distribution };
        delete currentDistribution[sectionName];

        // Reorder remaining sections
        const reorderedDistribution: Record<string, SectionDistribution> = {};
        Object.keys(currentDistribution)
            .sort((a, b) => currentDistribution[a].order - currentDistribution[b].order)
            .forEach((name, index) => {
                reorderedDistribution[name] = {
                    ...currentDistribution[name],
                    order: index + 1
                };
            });

        setEngine({
            ...engine,
            layout: {
                ...engine.layout,
                distribution: reorderedDistribution
            }
        });
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const selectedSections = getSelectedSections();
        const items = Array.from(selectedSections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update distribution with new order using name as key
        const newDistribution: Record<string, SectionDistribution> = {};
        items.forEach((item, index) => {
            newDistribution[item.name] = {
                ...engine.layout.distribution[item.name],
                order: index + 1
            };
        });

        setEngine({
            ...engine,
            layout: {
                ...engine.layout,
                distribution: newDistribution
            }
        });
    };

    const updateSectionColumn = (sectionName: string, position: "left" | "right") => {
        const currentDistribution = engine.layout.distribution || {};
        setEngine({
            ...engine,
            layout: {
                ...engine.layout,
                distribution: {
                    ...currentDistribution,
                    [sectionName]: {
                        ...currentDistribution[sectionName],
                        position: position
                    }
                }
            }
        });
    };

    const toggleVisibility = (sectionName: string) => {
        const currentDistribution = engine.layout.distribution || {};
        const currentVisibility = currentDistribution[sectionName]?.visible ?? true;
        
        setEngine({
            ...engine,
            layout: {
                ...engine.layout,
                distribution: {
                    ...currentDistribution,
                    [sectionName]: {
                        ...currentDistribution[sectionName],
                        visible: !currentVisibility
                    }
                }
            }
        });
    };

    const unselectedSections = getUnselectedSections();
    const selectedSections = getSelectedSections().sort((a, b) => 
        (engine.layout.distribution[a.name]?.order || 0) - (engine.layout.distribution[b.name]?.order || 0)
    );

    return (
        <div className="space-y-4">
            {/* Available Sections */}
            <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Available Sections ({unselectedSections.length})
                </h4>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {unselectedSections.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => addSection(section)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all text-sm cursor-pointer"
                        >
                            <span className="text-base">{sectionIcons[section.name] || '📄'}</span>
                            <span>{section.name}</span>
                            <span className="text-blue-500 text-lg font-bold ml-1">+</span>
                        </button>
                    ))}
                    {unselectedSections.length === 0 && (
                        <div className="text-sm text-green-600 py-2 w-full text-center">
                            ✓ All sections have been added
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Sections */}
            {selectedSections.length > 0 && (
                <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Selected Sections ({selectedSections.length}) - Drag to reorder
                    </h4>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="sections">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2 max-h-96 overflow-y-auto p-1"
                                >
                                    {selectedSections.map((section, index) => {
                                        const distribution = engine.layout.distribution[section.name];
                                        const isVisible = distribution?.visible ?? true;
                                        
                                        return (
                                            <Draggable 
                                                key={section.id} 
                                                draggableId={section.name}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
                                                            snapshot.isDragging
                                                                ? 'border-blue-500 shadow-lg bg-blue-50'
                                                                : !isVisible
                                                                ? 'border-gray-300 bg-gray-50 opacity-60'
                                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                className="cursor-move text-gray-400 hover:text-gray-600 text-xl"
                                                            >
                                                                ⋮⋮
                                                            </div>
                                                            <span className="text-xl">{sectionIcons[section.name] || '📄'}</span>
                                                            <span className={`font-medium ${!isVisible ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                                {section.name}
                                                            </span>
                                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                #{distribution?.order || index + 1}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleVisibility(section.name)}
                                                                className={`text-xs px-2 py-1 rounded transition ${
                                                                    isVisible
                                                                        ? 'text-green-600 hover:bg-green-50'
                                                                        : 'text-gray-400 hover:bg-gray-200'
                                                                }`}
                                                                title={isVisible ? 'Hide section' : 'Show section'}
                                                            >
                                                                {isVisible ? '👁️' : '🚫'}
                                                            </button>
                                                        </div>

                                                        {isTwoColumns && (
                                                            <div className="flex gap-2 mr-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateSectionColumn(section.name, 'left')}
                                                                    className={`px-3 py-1 text-xs font-medium rounded transition ${
                                                                        distribution?.position === 'left'
                                                                            ? 'bg-blue-500 text-white'
                                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                    }`}
                                                                >
                                                                    Left
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateSectionColumn(section.name, 'right')}
                                                                    className={`px-3 py-1 text-xs font-medium rounded transition ${
                                                                        distribution?.position === 'right'
                                                                            ? 'bg-blue-500 text-white'
                                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                    }`}
                                                                >
                                                                    Right
                                                                </button>
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => removeSection(section.name)}
                                                            className="ml-2 text-red-400 hover:text-red-600 text-xl leading-none font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 transition"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            )}

            {/* Statistics */}
            {selectedSections.length > 0 && (
                <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span>📊 Total: {selectedSections.length} sections</span>
                        {isTwoColumns && (
                            <div className="flex gap-4">
                                <span>📌 Left: {selectedSections.filter(s => engine.layout.distribution[s.name]?.position === 'left').length}</span>
                                <span>📌 Right: {selectedSections.filter(s => engine.layout.distribution[s.name]?.position === 'right').length}</span>
                                <span>👁️ Visible: {selectedSections.filter(s => engine.layout.distribution[s.name]?.visible !== false).length}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {selectedSections.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-gray-500 text-sm font-medium">No sections selected yet</p>
                    <p className="text-gray-400 text-xs mt-1">Click on any section above to add it to your resume</p>
                    {isTwoColumns && (
                        <p className="text-blue-500 text-xs mt-2">💡 Two-column mode: Sections will be added to the right column by default</p>
                    )}
                </div>
            )}
        </div>
    );
}