// src/hooks/Style/components/FloatingStyleToolbar.tsx
import { useState, useRef, useEffect } from 'react';
import { SchemaNode } from '@/types/resume/schemaSection';
import { STYLE_PRESETS } from '../constants';
import { selectors } from '../useStyleEditor';

interface FloatingStyleToolbarProps {
  selectedNode: {
    style: any;
    node: SchemaNode;
    path: string[];
  } | null;
  applyToAllSameTag: boolean;
  onApplyToAllChange: (value: boolean) => void;
  onUpdateStyle: (nodeId: string, styleKey: string, value: string, applyToAll?: boolean) => void;
  onApplyPreset: (nodeId: string, presetStyles: Record<string, string>, applyToAll?: boolean) => void;
  onResetStyle: (nodeId: string, applyToAll?: boolean) => void;
  onAIClick: () => void;
  position?: { x: number; y: number };
}

export default function FloatingStyleToolbar({
  selectedNode,
  applyToAllSameTag,
  onApplyToAllChange,
  onUpdateStyle,
  onApplyPreset,
  onResetStyle,
  onAIClick,
  position,
}: FloatingStyleToolbarProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'layout' | 'advanced'>('style');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (position) {
      setToolbarPosition(position);
    } else {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setToolbarPosition({
        x: (width - 600) / 2,
        y: height - 120,
      });
    }
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!toolbarRef.current) return;
    setIsDragging(true);
    const rect = toolbarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setToolbarPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!selectedNode) {
    return (
      <div
        ref={toolbarRef}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
        }}
        className="bg-white/90 backdrop-blur-sm rounded-full shadow-xl border border-gray-200 px-6 py-3 flex items-center gap-4"
      >
        <span className="text-sm text-gray-400">🎯 Click any element to customize</span>
        <button
          onClick={onAIClick}
          className="px-4 py-1.5 text-sm bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm flex items-center gap-2"
        >
          🤖 AI Generate
        </button>
      </div>
    );
  }

  const { style, node, path } = selectedNode;
  const presets = selectors.getPresetsForNode(node);

  if (isMinimized) {
    return (
      <div
        ref={toolbarRef}
        style={{
          position: 'fixed',
          left: toolbarPosition.x,
          top: toolbarPosition.y,
          zIndex: 50,
          cursor: 'grab',
        }}
        className="bg-white/90 backdrop-blur-sm rounded-full shadow-xl border border-gray-200 px-4 py-2 flex items-center gap-3"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-medium text-gray-700">✏️ {node.name}</span>
        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{node.tag}</span>
        <button onClick={() => setIsMinimized(false)} className="text-gray-400 hover:text-gray-600 transition">⬆</button>
        <button onClick={onAIClick} className="text-sm bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-full px-3 py-1 hover:from-purple-600 hover:to-blue-600 transition">🤖</button>
      </div>
    );
  }

  return (
    <div
      ref={toolbarRef}
      style={{
        position: 'fixed',
        left: toolbarPosition.x,
        top: toolbarPosition.y,
        zIndex: 50,
        cursor: isDragging ? 'grabbing' : 'grab',
        minWidth: '600px',
        maxWidth: '90vw',
      }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200"
    >
      {/* Drag Handle */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-50/80 rounded-t-2xl border-b border-gray-100 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">⋮⋮</span>
          <span className="text-xs font-medium text-gray-500">Editing:</span>
          <span className="text-sm font-semibold text-gray-800">{node.name}</span>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-mono">{node.tag}</span>
          <span className="text-xs text-gray-400 hidden sm:inline">{path.join(' › ')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(true)} className="text-gray-400 hover:text-gray-600 transition" title="Minimize">⬇</button>
          <button
            onClick={() => setToolbarPosition({ x: (window.innerWidth - 600) / 2, y: window.innerHeight - 120 })}
            className="text-gray-400 hover:text-gray-600 transition"
            title="Reset position"
          >⟲</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-2 border-b border-gray-200">
        {[
          { id: 'style', label: '🎨 Style' },
          { id: 'layout', label: '📐 Layout' },
          { id: 'advanced', label: '⚙️ Advanced' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 border border-b-0 border-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={onAIClick}
          className="px-3 py-1.5 text-xs bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm flex items-center gap-1.5"
        >
          🤖 AI
        </button>
        <button
          onClick={() => onResetStyle(style.id, applyToAllSameTag)}
          className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
        >
          ↺ Reset
        </button>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none ml-1">
          <input
            type="checkbox"
            checked={applyToAllSameTag}
            onChange={(e) => onApplyToAllChange(e.target.checked)}
            className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
          />
          All <span className="font-mono bg-gray-200 px-1 rounded">{node.tag}</span>
        </label>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[300px] overflow-y-auto">
        {activeTab === 'style' && (
          <StyleTab
            node={node}
            style={style}
            presets={presets}
            applyToAll={applyToAllSameTag}
            onUpdateStyle={onUpdateStyle}
            onApplyPreset={onApplyPreset}
          />
        )}
        {activeTab === 'layout' && (
          <LayoutTab
            node={node}
            style={style}
            applyToAll={applyToAllSameTag}
            onUpdateStyle={onUpdateStyle}
          />
        )}
        {activeTab === 'advanced' && (
          <AdvancedTab
            node={node}
            style={style}
            applyToAll={applyToAllSameTag}
            onUpdateStyle={onUpdateStyle}
          />
        )}
      </div>
    </div>
  );
}

// ========================
// Style Tab - Compact
// ========================

function StyleTab({ node, style, presets, applyToAll, onUpdateStyle, onApplyPreset }: any) {
  return (
    <div className="space-y-3">
      {presets && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 mr-1">Presets:</span>
          {Object.entries(presets).map(([key, preset]: any) => (
            <button
              key={key}
              onClick={() => onApplyPreset(style.id, preset.styles, applyToAll)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Bg:</span>
          <input
            type="color"
            value={style.style.backgroundColor || '#ffffff'}
            onChange={(e) => onUpdateStyle(style.id, 'backgroundColor', e.target.value, applyToAll)}
            className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={style.style.backgroundColor || '#ffffff'}
            onChange={(e) => onUpdateStyle(style.id, 'backgroundColor', e.target.value, applyToAll)}
            className="w-16 px-1.5 py-0.5 border border-gray-200 rounded text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Text:</span>
          <input
            type="color"
            value={style.style.color || '#000000'}
            onChange={(e) => onUpdateStyle(style.id, 'color', e.target.value, applyToAll)}
            className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={style.style.color || '#000000'}
            onChange={(e) => onUpdateStyle(style.id, 'color', e.target.value, applyToAll)}
            className="w-16 px-1.5 py-0.5 border border-gray-200 rounded text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Size:</span>
          <select
            value={style.style.fontSize || '14px'}
            onChange={(e) => onUpdateStyle(style.id, 'fontSize', e.target.value, applyToAll)}
            className="px-1.5 py-0.5 border border-gray-200 rounded text-xs"
          >
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="24px">24</option>
            <option value="32px">32</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Weight:</span>
          <select
            value={style.style.fontWeight || 'normal'}
            onChange={(e) => onUpdateStyle(style.id, 'fontWeight', e.target.value, applyToAll)}
            className="px-1.5 py-0.5 border border-gray-200 rounded text-xs"
          >
            <option value="normal">Normal</option>
            <option value="500">Medium</option>
            <option value="600">Semi</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-0.5">Align:</span>
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => onUpdateStyle(style.id, 'textAlign', align, applyToAll)}
              className={`px-2 py-0.5 text-xs rounded border transition ${
                style.style.textAlign === align
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {align === 'left' && '←'}
              {align === 'center' && '↔'}
              {align === 'right' && '→'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Pad:</span>
          <input
            type="text"
            value={style.style.padding || '0px'}
            onChange={(e) => onUpdateStyle(style.id, 'padding', e.target.value, applyToAll)}
            className="w-14 px-1.5 py-0.5 border border-gray-200 rounded text-xs"
            placeholder="8px"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Mar:</span>
          <input
            type="text"
            value={style.style.margin || '0px'}
            onChange={(e) => onUpdateStyle(style.id, 'margin', e.target.value, applyToAll)}
            className="w-14 px-1.5 py-0.5 border border-gray-200 rounded text-xs"
            placeholder="0px"
          />
        </div>
      </div>
    </div>
  );
}

// ========================
// Layout Tab - Compact
// ========================

function LayoutTab({ node, style, applyToAll, onUpdateStyle }: any) {
  const isFlex = style.style.display === 'flex';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Display:</span>
          <select
            value={style.style.display || 'block'}
            onChange={(e) => onUpdateStyle(style.id, 'display', e.target.value, applyToAll)}
            className="px-1.5 py-0.5 border border-gray-200 rounded text-xs"
          >
            <option value="block">Block</option>
            <option value="flex">Flex</option>
            <option value="inline-flex">Inline Flex</option>
            <option value="inline-block">Inline Block</option>
          </select>
        </div>

        {isFlex && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Dir:</span>
              <select
                value={style.style.flexDirection || 'row'}
                onChange={(e) => onUpdateStyle(style.id, 'flexDirection', e.target.value, applyToAll)}
                className="px-1.5 py-0.5 border border-gray-200 rounded text-xs"
              >
                <option value="row">Row</option>
                <option value="column">Col</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Gap:</span>
              <input
                type="text"
                value={style.style.gap || '0px'}
                onChange={(e) => onUpdateStyle(style.id, 'gap', e.target.value, applyToAll)}
                className="w-12 px-1.5 py-0.5 border border-gray-200 rounded text-xs"
                placeholder="8px"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Align:</span>
              <select
                value={style.style.alignItems || 'stretch'}
                onChange={(e) => onUpdateStyle(style.id, 'alignItems', e.target.value, applyToAll)}
                className="px-1.5 py-0.5 border border-gray-200 rounded text-xs"
              >
                <option value="stretch">Stretch</option>
                <option value="center">Center</option>
                <option value="flex-start">Start</option>
                <option value="flex-end">End</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Justify:</span>
              <select
                value={style.style.justifyContent || 'flex-start'}
                onChange={(e) => onUpdateStyle(style.id, 'justifyContent', e.target.value, applyToAll)}
                className="px-1.5 py-0.5 border border-gray-200 rounded text-xs"
              >
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="space-between">Between</option>
                <option value="space-around">Around</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ========================
// Advanced Tab - Compact
// ========================

function AdvancedTab({ node, style, applyToAll, onUpdateStyle }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Border:</span>
          <select
            value={style.style.border || 'none'}
            onChange={(e) => onUpdateStyle(style.id, 'border', e.target.value, applyToAll)}
            className="px-1.5 py-0.5 border border-gray-200 rounded text-xs"
          >
            <option value="none">None</option>
            <option value="1px solid #e5e7eb">Light</option>
            <option value="2px solid #e5e7eb">Medium</option>
            <option value="2px solid #3b82f6">Blue</option>
            <option value="2px solid #10b981">Green</option>
            <option value="2px solid #ef4444">Red</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Radius:</span>
          <select
            value={style.style.borderRadius || '0px'}
            onChange={(e) => onUpdateStyle(style.id, 'borderRadius', e.target.value, applyToAll)}
            className="px-1.5 py-0.5 border border-gray-200 rounded text-xs"
          >
            <option value="0px">Square</option>
            <option value="4px">Slight</option>
            <option value="8px">Rounded</option>
            <option value="12px">Very</option>
            <option value="9999px">Circular</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Opacity:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={style.style.opacity || '1'}
            onChange={(e) => onUpdateStyle(style.id, 'opacity', e.target.value, applyToAll)}
            className="w-24"
          />
          <span className="text-xs text-gray-400 w-8">{style.style.opacity || '1'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Shadow:</span>
          <select
            value={style.style.boxShadow || 'none'}
            onChange={(e) => onUpdateStyle(style.id, 'boxShadow', e.target.value, applyToAll)}
            className="px-1.5 py-0.5 border border-gray-200 rounded text-xs"
          >
            <option value="none">None</option>
            <option value="0 1px 3px rgba(0,0,0,0.1)">Subtle</option>
            <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
            <option value="0 10px 25px rgba(0,0,0,0.15)">Large</option>
          </select>
        </div>
      </div>
    </div>
  );
}