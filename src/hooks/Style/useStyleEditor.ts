// src/hooks/Style/useStyleEditor.ts
import { useState, useEffect, useCallback } from 'react';
type Engine = { layout: { distribution?: Record<string, { visible?: boolean; order?: number }> } };
import { SectionStyle } from '@/types/resume/SectionStyle';
import { Section } from '@/types/resume/Section';
import { SchemaNode } from '@/types/resume/schemaSection';
import {
  StyleEditorState,
  StyleEditorActions,
  GlobalStyles,
  StyleEditorHook
} from './types';
import { DEFAULT_GLOBAL_STYLES, STYLE_PRESETS } from './constants';

export { STYLE_PRESETS };

export function useStyleEditor(
  engine: Engine,
  sections: Section[],
  initialStyles?: SectionStyle[]
): StyleEditorHook {
  // ========================
  // STATE
  // ========================

  const [state, setState] = useState<StyleEditorState>(() => ({
    globalStyles: DEFAULT_GLOBAL_STYLES,
    nodeStyles: initialStyles || [],
    selectedNodeId: null,
    applyToAllSameTag: false,
    activePreset: null,
    version: 0,
    loading: true,
  }));

  // ========================
  // HELPER FUNCTIONS
  // ========================

  const getSelectedSections = useCallback((): Section[] => {
    if (!sections.length) return [];
    const distribution = engine.layout.distribution || {};
    const selectedNames = Object.keys(distribution);
    return sections
      .filter(section =>
        selectedNames.includes(section.name) &&
        distribution[section.name]?.visible !== false
      )
      .sort((a, b) => {
        const orderA = distribution[a.name]?.order ?? Infinity;
        const orderB = distribution[b.name]?.order ?? Infinity;
        return orderA - orderB;
      });
  }, [sections, engine.layout.distribution]);

  const getAllSchemaNodes = useCallback((node: SchemaNode, path: string[] = []): { node: SchemaNode; path: string[] }[] => {
    const currentPath = [...path, node.name];
    let nodes = [{ node, path: currentPath }];
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        nodes = [...nodes, ...getAllSchemaNodes(child, currentPath)];
      });
    }
    return nodes;
  }, []);

  const getDefaultStylesForNode = useCallback((node: SchemaNode): Record<string, string> => {
    const tagStyles = state.globalStyles.tags;
    const tagStyle = tagStyles[node.tag] || {};
    return { ...tagStyle };
  }, [state.globalStyles.tags]);

  const buildStyleTree = useCallback((node: SchemaNode): SectionStyle => {
    return {
      id: node.id,
      style: getDefaultStylesForNode(node),
      children: node.children && node.children.length > 0
        ? node.children.map(child => buildStyleTree(child))
        : []
    };
  }, [getDefaultStylesForNode]);

  const getAllStyleNodes = useCallback((styles: SectionStyle[], allSections: Section[]): {
    style: SectionStyle;
    node: SchemaNode;
    path: string[];
    isSection: boolean;
  }[] => {
    const result: { style: SectionStyle; node: SchemaNode; path: string[]; isSection: boolean }[] = [];

    styles.forEach(styleNode => {
      let foundNode: SchemaNode | null = null;
      let foundPath: string[] = [];
      let isSection = false;

      for (const section of allSections) {
        const allNodes = getAllSchemaNodes(section.schema);
        const found = allNodes.find(n => n.node.id === styleNode.id);
        if (found) {
          foundNode = found.node;
          foundPath = [section.name, ...found.path.slice(1)];
          isSection = found.node.tag === 'section';
          break;
        }
      }

      if (foundNode) {
        result.push({
          style: styleNode,
          node: foundNode,
          path: foundPath,
          isSection: isSection
        });
      }

      if (styleNode.children && styleNode.children.length > 0) {
        result.push(...getAllStyleNodes(styleNode.children, allSections));
      }
    });

    return result;
  }, [getAllSchemaNodes]);

  const findNodesByTag = useCallback((styles: SectionStyle[], tag: string): string[] => {
    const ids: string[] = [];
    const traverse = (styleNodes: SectionStyle[]) => {
      styleNodes.forEach(styleNode => {
        let foundNode: SchemaNode | null = null;
        for (const section of sections) {
          const allNodes = getAllSchemaNodes(section.schema);
          const found = allNodes.find(n => n.node.id === styleNode.id);
          if (found) {
            foundNode = found.node;
            break;
          }
        }
        if (foundNode && foundNode.tag === tag) {
          ids.push(styleNode.id);
        }
        if (styleNode.children && styleNode.children.length > 0) {
          traverse(styleNode.children);
        }
      });
    };
    traverse(styles);
    return ids;
  }, [sections, getAllSchemaNodes]);

  const findNodeById = useCallback((nodeId: string): { node: SchemaNode; section: Section; path: string[] } | null => {
    const selectedSections = getSelectedSections();
    for (const section of selectedSections) {
      const allNodes = getAllSchemaNodes(section.schema);
      const found = allNodes.find(n => n.node.id === nodeId);
      if (found) {
        return {
          node: found.node,
          section: section,
          path: [section.name, ...found.path.slice(1)]
        };
      }
    }
    return null;
  }, [getSelectedSections, getAllSchemaNodes]);

  const updateNodeStyleInTree = useCallback((
    styles: SectionStyle[],
    nodeId: string,
    styleKey: string,
    value: string
  ): SectionStyle[] => {
    return styles.map(s => {
      if (s.id === nodeId) {
        const newStyle = { ...s.style };
        if (styleKey === 'border') {
          delete newStyle.borderBottom;
          delete newStyle.borderTop;
          delete newStyle.borderLeft;
          delete newStyle.borderRight;
        }
        if (['borderBottom', 'borderTop', 'borderLeft', 'borderRight'].includes(styleKey)) {
          delete newStyle.border;
        }
        newStyle[styleKey] = value;
        return {
          ...s,
          style: newStyle
        };
      }
      if (s.children && s.children.length > 0) {
        return {
          ...s,
          children: updateNodeStyleInTree(s.children, nodeId, styleKey, value)
        };
      }
      return s;
    });
  }, []);

  const resetNodeStyleInTree = useCallback((
    styles: SectionStyle[],
    nodeId: string
  ): SectionStyle[] => {
    const nodeInfo = findNodeById(nodeId);
    if (!nodeInfo) return styles;

    return styles.map(s => {
      if (s.id === nodeId) {
        return buildStyleTree(nodeInfo.node);
      }
      if (s.children && s.children.length > 0) {
        return {
          ...s,
          children: resetNodeStyleInTree(s.children, nodeId)
        };
      }
      return s;
    });
  }, [findNodeById, buildStyleTree]);

  // ========================
  // INITIALIZATION
  // ========================

  useEffect(() => {
    if (sections.length > 0 && state.nodeStyles.length === 0) {
      const selectedSections = getSelectedSections();
      if (selectedSections.length > 0) {
        const initialStyles: SectionStyle[] = selectedSections.map(section => {
          return buildStyleTree(section.schema);
        });
        setState(prev => ({
          ...prev,
          nodeStyles: initialStyles,
          version: prev.version + 1,
          loading: false,
        }));
      }
    }
  }, [sections, getSelectedSections, buildStyleTree, state.nodeStyles.length]);

  // ========================
  // ACTIONS
  // ========================

  const actions: StyleEditorActions = {
    // ----- Global Style Actions -----
    updateGlobalStyle: (styleKey, value) => {
      setState(prev => ({
        ...prev,
        globalStyles: {
          ...prev.globalStyles,
          resume: {
            ...prev.globalStyles.resume,
            [styleKey]: value,
          }
        },
        version: prev.version + 1,
      }));
    },

    updateGlobalTagStyle: (tag, styleKey, value) => {
      setState(prev => ({
        ...prev,
        globalStyles: {
          ...prev.globalStyles,
          tags: {
            ...prev.globalStyles.tags,
            [tag]: {
              ...prev.globalStyles.tags[tag],
              [styleKey]: value,
            }
          }
        },
        version: prev.version + 1,
      }));
    },

    resetGlobalStyles: () => {
      setState(prev => ({
        ...prev,
        globalStyles: DEFAULT_GLOBAL_STYLES,
        version: prev.version + 1,
      }));
    },

    resetGlobalTagStyle: (tag) => {
      setState(prev => ({
        ...prev,
        globalStyles: {
          ...prev.globalStyles,
          tags: {
            ...prev.globalStyles.tags,
            [tag]: DEFAULT_GLOBAL_STYLES.tags[tag] || {},
          }
        },
        version: prev.version + 1,
      }));
    },

    // ----- Node Selection -----
    selectNode: (nodeId) => {
      setState(prev => ({
        ...prev,
        selectedNodeId: nodeId,
        activePreset: null,
      }));
    },

    // ----- Node Style Actions -----
    updateNodeStyle: (nodeId, styleKey, value, applyToAll = false) => {
      let updatedNodeStyles = state.nodeStyles;

      if (applyToAll) {
        const nodeInfo = findNodeById(nodeId);
        if (nodeInfo) {
          const allNodesWithTag = findNodesByTag(state.nodeStyles, nodeInfo.node.tag);
          allNodesWithTag.forEach(id => {
            updatedNodeStyles = updateNodeStyleInTree(updatedNodeStyles, id, styleKey, value);
          });
        }
      } else {
        updatedNodeStyles = updateNodeStyleInTree(updatedNodeStyles, nodeId, styleKey, value);
      }

      setState(prev => ({
        ...prev,
        nodeStyles: updatedNodeStyles,
        version: prev.version + 1,
        activePreset: null,
      }));
    },

    applyPresetToNode: (nodeId, presetStyles, applyToAll = false) => {
      let updatedNodeStyles = state.nodeStyles;

      if (applyToAll) {
        const nodeInfo = findNodeById(nodeId);
        if (nodeInfo) {
          const allNodesWithTag = findNodesByTag(state.nodeStyles, nodeInfo.node.tag);
          allNodesWithTag.forEach(id => {
            Object.entries(presetStyles).forEach(([key, value]) => {
              updatedNodeStyles = updateNodeStyleInTree(updatedNodeStyles, id, key, value);
            });
          });
        }
      } else {
        Object.entries(presetStyles).forEach(([key, value]) => {
          updatedNodeStyles = updateNodeStyleInTree(updatedNodeStyles, nodeId, key, value);
        });
      }

      setState(prev => ({
        ...prev,
        nodeStyles: updatedNodeStyles,
        version: prev.version + 1,
        activePreset: nodeId,
      }));
    },

    resetNodeStyle: (nodeId, applyToAll = false) => {
      let updatedNodeStyles = state.nodeStyles;

      if (applyToAll) {
        const nodeInfo = findNodeById(nodeId);
        if (nodeInfo) {
          const allNodesWithTag = findNodesByTag(state.nodeStyles, nodeInfo.node.tag);
          allNodesWithTag.forEach(id => {
            updatedNodeStyles = resetNodeStyleInTree(updatedNodeStyles, id);
          });
        }
      } else {
        updatedNodeStyles = resetNodeStyleInTree(updatedNodeStyles, nodeId);
      }

      setState(prev => ({
        ...prev,
        nodeStyles: updatedNodeStyles,
        version: prev.version + 1,
        activePreset: null,
      }));
    },

    // ----- Bulk Actions -----
    applyGlobalStylesToNodes: () => {
      const selectedSections = getSelectedSections();
      const newStyles = selectedSections.map(section => buildStyleTree(section.schema));

      setState(prev => ({
        ...prev,
        nodeStyles: newStyles,
        version: prev.version + 1,
      }));
    },

    applyTagStylesToNodes: (tag) => {
      const nodeIds = findNodesByTag(state.nodeStyles, tag);
      const tagStyles = state.globalStyles.tags[tag] || {};

      let updatedNodeStyles = state.nodeStyles;
      nodeIds.forEach(id => {
        Object.entries(tagStyles).forEach(([key, value]) => {
          updatedNodeStyles = updateNodeStyleInTree(updatedNodeStyles, id, key, value);
        });
      });

      setState(prev => ({
        ...prev,
        nodeStyles: updatedNodeStyles,
        version: prev.version + 1,
      }));
    },

    syncStyles: () => {
      const allNodes = getAllStyleNodes(state.nodeStyles, sections);
      let updatedNodeStyles = state.nodeStyles;

      allNodes.forEach(({ style, node }) => {
        const tagStyles = state.globalStyles.tags[node.tag] || {};
        Object.entries(tagStyles).forEach(([key, value]) => {
          if (!style.style[key]) {
            updatedNodeStyles = updateNodeStyleInTree(updatedNodeStyles, style.id, key, value);
          }
        });
      });

      setState(prev => ({
        ...prev,
        nodeStyles: updatedNodeStyles,
        version: prev.version + 1,
      }));
    },

    // ----- AI Generation -----
    generateAIStyle: async (prompt) => {
      if (!prompt.trim()) return false;

      try {
        const selectedSections = getSelectedSections();
        const response = await fetch('/api/admin/style', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sections: selectedSections,
            prompt: prompt,
            currentStyle: state.nodeStyles,
            globalStyles: state.globalStyles,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate styles');

        const data = await response.json();
        if (data.success && data.styles) {
          setState(prev => ({
            ...prev,
            nodeStyles: data.styles,
            version: prev.version + 1,
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error generating AI styles:', error);
        return false;
      }
    },

    // ----- Getters -----
    getSelectedNode: () => {
      if (!state.selectedNodeId) return null;
      const allNodes = getAllStyleNodes(state.nodeStyles, sections);
      const found = allNodes.find(n => n.style.id === state.selectedNodeId);
      if (found) {
        return {
          style: found.style,
          node: found.node,
          path: found.path,
        };
      }
      return null;
    },

    getAllNodes: () => {
      return getAllStyleNodes(state.nodeStyles, sections);
    },

    getNodesByTag: (tag) => {
      return getAllStyleNodes(state.nodeStyles, sections)
        .filter(n => n.node.tag === tag);
    },

    // ----- Setter -----
    setApplyToAll: (value) => {
      setState(prev => ({
        ...prev,
        applyToAllSameTag: value,
      }));
    },
  };

  // ========================
  // RETURN
  // ========================

  return {
    state,
    actions,
  };
}

// ========================
// SELECTORS
// ========================

export const selectors = {
  getPresetsForNode: (node: SchemaNode) => {
    if (node.tag === 'section') return STYLE_PRESETS.section;
    if (['h1', 'h2', 'h3'].includes(node.tag)) return STYLE_PRESETS.heading;
    if (['p', 'span', 'li'].includes(node.tag)) return STYLE_PRESETS.text;
    return null;
  },

  getGlobalStyleKeys: (): (keyof GlobalStyles['resume'])[] => {
    return ['fontFamily', 'fontSize', 'color', 'backgroundColor', 'margin', 'padding', 'maxWidth'];
  },

  getTagOptions: (): string[] => {
    return ['section', 'h1', 'h2', 'h3', 'p', 'span', 'ul', 'li', 'i', 'a', 'img'];
  },
};