export type ToolbarPositionMode = "fixed" | "selection" | "cursor" | "manual";
export type ToolbarVisualStyle = "default" | "compact";
export type ToolbarItemType = "builtin" | "obsidian" | "separator";
export type ToolbarPresetId = "writer" | "zettelkasten" | "code-notes" | "compact";

export interface ToolbarPosition {
  left: number;
  top: number;
}

export interface ToolbarItem {
  id: string;
  type: ToolbarItemType;
  commandId?: string;
}

export interface MdMenuSettings {
  enabled: boolean;
  positionMode: ToolbarPositionMode;
  visualStyle: ToolbarVisualStyle;
  manualPosition: ToolbarPosition | null;
  toolbarItems: ToolbarItem[];
}

export interface BuiltInCommandDefinition {
  id: string;
  name: string;
  icon: string;
  group?: "formatting" | "headings" | "blocks" | "links" | "utility";
}

export interface ToolbarPreset {
  id: ToolbarPresetId;
  name: string;
  items: ToolbarItem[];
}
