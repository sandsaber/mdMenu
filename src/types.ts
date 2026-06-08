export type ToolbarPositionMode = "fixed" | "selection" | "cursor";
export type ToolbarVisualStyle = "default" | "compact";
export type ToolbarItemType = "builtin" | "obsidian";

export interface ToolbarItem {
  id: string;
  type: ToolbarItemType;
  commandId: string;
}

export interface ObMenuSettings {
  enabled: boolean;
  positionMode: ToolbarPositionMode;
  visualStyle: ToolbarVisualStyle;
  toolbarItems: ToolbarItem[];
}

export interface BuiltInCommandDefinition {
  id: string;
  name: string;
  icon: string;
  group?: "formatting" | "headings" | "blocks" | "links";
}
