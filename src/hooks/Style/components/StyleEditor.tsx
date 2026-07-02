
import { useStyleEditor, selectors } from '@/hooks/useStyleEditor';
import BuildLayout from '@/hooks/Canava/BuildLayout';

export default function StyleEditor({ engine, sections, onStylesChange }) {
    const [state, actions] = useStyleEditor(engine, sections);
    const {
        globalStyles,
        nodeStyles,
        selectedNodeId,
        applyToAllSameTag,
        version,
        loading,
    } = state;

    const {
        updateGlobalStyle,
        updateGlobalTagStyle,
        selectNode,
        updateNodeStyle,
        applyPresetToNode,
        resetNodeStyle,
        getSelectedNode,
        getAllNodes,
        generateAIStyle,
    } = actions;

    const selectedNode = getSelectedNode();
    const allNodes = getAllNodes();

    // Handle click on element in BuildLayout
    const handleElementClick = (nodeId: string) => {
        selectNode(nodeId);
    };

    // Pass click handler to BuildLayout
    return (
        <div className="flex gap-6">
            <div className="flex-1">
                <BuildLayout
                    key={`style-${version}`}
                    layout={engine.layout}
                    sections={sections}
                    style={nodeStyles}
                    onElementClick={handleElementClick}
                    selectedNodeId={selectedNodeId}
                />
            </div>

            <div className="w-96">
                {/* Global Styles Panel */}
                <GlobalStylesPanel
                    globalStyles={globalStyles}
                    onUpdateGlobal={updateGlobalStyle}
                    onUpdateTag={updateGlobalTagStyle}
                />

                {/* Node Styles Panel */}
                {selectedNode && (
                    <NodeStylesPanel
                        selectedNode={selectedNode}
                        applyToAllSameTag={applyToAllSameTag}
                        onApplyToAllChange={(value) =>
                            setState(prev => ({ ...prev, applyToAllSameTag: value }))
                        }
                        onUpdateStyle={updateNodeStyle}
                        onApplyPreset={applyPresetToNode}
                        onReset={resetNodeStyle}
                        presets={selectors.getPresetsForNode(selectedNode.node)}
                    />
                )}
            </div>
        </div>
    );
}