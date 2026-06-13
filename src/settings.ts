import type {
  MdMenuSettings,
  ToolbarItem,
  ToolbarPosition,
  ToolbarPositionMode,
  ToolbarPreset,
  ToolbarVisualStyle,
} from "./types";

const POSITION_MODES = new Set<ToolbarPositionMode>([
  "fixed",
  "selection",
  "cursor",
  "manual",
]);
const VISUAL_STYLES = new Set<ToolbarVisualStyle>(["default", "compact"]);

function builtin(commandId: string): ToolbarItem {
  return { id: commandId, type: "builtin", commandId };
}

function separator(id: string): ToolbarItem {
  return { id, type: "separator" };
}

export const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  builtin("bold"),
  builtin("italic"),
  builtin("strikethrough"),
  builtin("highlight"),
  builtin("inline-code"),
  builtin("clear-formatting"),
  separator("sep-headings"),
  builtin("heading-1"),
  builtin("heading-2"),
  builtin("heading-3"),
  builtin("heading-4"),
  separator("sep-blocks"),
  builtin("checkbox"),
  builtin("bullet-list"),
  builtin("numbered-list"),
  builtin("blockquote"),
  builtin("callout"),
  separator("sep-links"),
  builtin("markdown-link"),
  builtin("wikilink"),
];

export const TOOLBAR_PRESETS: ToolbarPreset[] = [
  {
    id: "writer",
    name: "Writer",
    items: DEFAULT_TOOLBAR_ITEMS,
  },
  {
    id: "zettelkasten",
    name: "Zettelkasten",
    items: [
      builtin("bold"),
      builtin("italic"),
      builtin("highlight"),
      builtin("clear-formatting"),
      separator("sep-zettel-headings"),
      builtin("heading-2"),
      builtin("heading-3"),
      builtin("heading-4"),
      separator("sep-zettel-blocks"),
      builtin("checkbox"),
      builtin("blockquote"),
      separator("sep-zettel-links"),
      builtin("wikilink"),
      builtin("markdown-link"),
    ],
  },
  {
    id: "code-notes",
    name: "Code notes",
    items: [
      builtin("bold"),
      builtin("italic"),
      builtin("inline-code"),
      builtin("code-block"),
      builtin("clear-formatting"),
      separator("sep-code-headings"),
      builtin("heading-2"),
      builtin("heading-3"),
      separator("sep-code-blocks"),
      builtin("bullet-list"),
      builtin("numbered-list"),
      builtin("callout"),
      separator("sep-code-links"),
      builtin("markdown-link"),
      builtin("wikilink"),
    ],
  },
  {
    id: "compact",
    name: "Compact",
    items: [
      builtin("bold"),
      builtin("italic"),
      builtin("highlight"),
      builtin("inline-code"),
      separator("sep-compact-headings"),
      builtin("heading-group"),
      separator("sep-compact-blocks"),
      builtin("checkbox"),
      separator("sep-compact-links"),
      builtin("markdown-link"),
      builtin("wikilink"),
    ],
  },
];

export const DEFAULT_SETTINGS: MdMenuSettings = {
  enabled: true,
  positionMode: "fixed",
  visualStyle: "default",
  manualPosition: null,
  toolbarItems: DEFAULT_TOOLBAR_ITEMS,
};

function isManualPosition(value: unknown): value is ToolbarPosition {
  if (!value || typeof value !== "object") return false;

  const position = value as Partial<ToolbarPosition>;
  return Number.isFinite(position.left) && Number.isFinite(position.top);
}

function isToolbarItem(value: unknown): value is ToolbarItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<ToolbarItem>;
  if (typeof item.id !== "string" || item.id.trim().length === 0) return false;

  if (item.type === "separator") return true;

  return (
    (item.type === "builtin" || item.type === "obsidian") &&
    typeof item.commandId === "string" &&
    item.commandId.trim().length > 0
  );
}

export function normalizeSettings(saved: unknown): MdMenuSettings {
  if (!saved || typeof saved !== "object") {
    return structuredClone(DEFAULT_SETTINGS);
  }

  const input = saved as Partial<MdMenuSettings>;
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
    manualPosition: isManualPosition(input.manualPosition)
      ? { left: input.manualPosition.left, top: input.manualPosition.top }
      : DEFAULT_SETTINGS.manualPosition,
    toolbarItems:
      toolbarItems.length > 0
        ? toolbarItems
        : structuredClone(DEFAULT_TOOLBAR_ITEMS),
  };
}
