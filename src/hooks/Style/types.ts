// src/hooks/Style/types.ts
import { SectionStyle } from '@/types/resume/SectionStyle';
import { Section } from '@/types/resume/Section';
import { SchemaNode } from '@/types/resume/schemaSection';

export interface GlobalStyles {
  resume: {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
    margin?: string;
    padding?: string;
    maxWidth?: string;
  };
  tags: {
    [tag: string]: Record<string, string>;
  };
}

export interface StyleEditorState {
  globalStyles: GlobalStyles;
  nodeStyles: SectionStyle[];
  selectedNodeId: string | null;
  applyToAllSameTag: boolean;
  activePreset: string | null;
  version: number;
  loading: boolean;
}

export interface StyleEditorActions {
  // Global style actions
  updateGlobalStyle: (styleKey: keyof GlobalStyles['resume'], value: string) => void;
  updateGlobalTagStyle: (tag: string, styleKey: string, value: string) => void;
  resetGlobalStyles: () => void;
  resetGlobalTagStyle: (tag: string) => void;
  
  // Node style actions
  selectNode: (nodeId: string | null) => void;
  updateNodeStyle: (nodeId: string, styleKey: string, value: string, applyToAll?: boolean) => void;
  applyPresetToNode: (nodeId: string, presetStyles: Record<string, string>, applyToAll?: boolean) => void;
  resetNodeStyle: (nodeId: string, applyToAll?: boolean) => void;
  
  // Bulk actions
  applyGlobalStylesToNodes: () => void;
  applyTagStylesToNodes: (tag: string) => void;
  syncStyles: () => void;
  
  // AI generation
  generateAIStyle: (prompt: string) => Promise<boolean>;
  
  // State getters
  getSelectedNode: () => { style: SectionStyle; node: SchemaNode; path: string[] } | null;
  getAllNodes: () => { style: SectionStyle; node: SchemaNode; path: string[]; isSection: boolean }[];
  getNodesByTag: (tag: string) => { style: SectionStyle; node: SchemaNode; path: string[] }[];
  
  // Setter for applyToAll
  setApplyToAll: (value: boolean) => void;
}

export interface StyleEditorHook {
  state: StyleEditorState;
  actions: StyleEditorActions;
}