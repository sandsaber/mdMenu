import type {
  ObMenuSettings,
  ToolbarItem,
  ToolbarPositionMode,
  ToolbarVisualStyle,
} from "./types";

const POSITION_MODES = new Set<ToolbarPositionMode>([
  "fixed",
  "selection",
  "cursor",
]);
const VISUAL_STYLES = new Set<ToolbarVisualStyle>(["default", "compact"]);

export const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  { id: "bold", type: "builtin", commandId: "bold" },
  { id: "italic", type: "builtin", commandId: "italic" },
  { id: "strikethrough", type: "builtin", commandId: "strikethrough" },
  { id: "highlight", type: "builtin", commandId: "highlight" },
  { id: "inline-code", type: "builtin", commandId: "inline-code" },
  { id: "blockquote", type: "builtin", commandId: "blockquote" },
  { id: "checkbox", type: "builtin", commandId: "checkbox" },
  { id: "heading-group", type: "builtin", commandId: "heading-group" },
  { id: "wikilink", type: "builtin", commandId: "wikilink" },
];

export const DEFAULT_SETTINGS: ObMenuSettings = {
  enabled: true,
  positionMode: "fixed",
  visualStyle: "default",
  toolbarItems: DEFAULT_TOOLBAR_ITEMS,
};

function isToolbarItem(value: unknown): value is ToolbarItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<ToolbarItem>;
  return (
    typeof item.id === "string" &&
    item.id.trim().length > 0 &&
    (item.type === "builtin" || item.type === "obsidian") &&
    typeof item.commandId === "string" &&
    item.commandId.trim().length > 0
  );
}

export function normalizeSettings(saved: unknown): ObMenuSettings {
  if (!saved || typeof saved !== "object") {
    return structuredClone(DEFAULT_SETTINGS);
  }

  const input = saved as Partial<ObMenuSettings>;
  const toolbarItems = Array.isArray(input.toolbarItems)
    ? input.toolbarItems.filter(isToolbarItem)
    : [];

  return {
    enabled:
      typeof input.enabled === "boolean" ? input.enabled : DEFAULT_SETTINGS.enabled,
    positionMode: POSITION_MODES.has(input.positionMode as ToolbarPositionMode)
      ? (input.positionMode as ToolbarPositionMode)
      : DEFAULT_SETTINGS.positionMode,
    visualStyle: VISUAL_STYLES.has(input.visualStyle as ToolbarVisualStyle)
      ? (input.visualStyle as ToolbarVisualStyle)
      : DEFAULT_SETTINGS.visualStyle,
    toolbarItems:
      toolbarItems.length > 0
        ? toolbarItems
        : structuredClone(DEFAULT_TOOLBAR_ITEMS),
  };
}
