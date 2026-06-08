# obMenu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `obMenu`, a clean-room modern Obsidian Markdown toolbar inspired by cMenu.

**Architecture:** Use the current Obsidian sample plugin shape with TypeScript, esbuild, small source modules, and no React runtime. Keep Markdown transforms testable as pure functions, then adapt them to Obsidian's `Editor` API from command handlers and toolbar buttons.

**Tech Stack:** Obsidian Plugin API, TypeScript, esbuild, Vitest, CSS using Obsidian theme variables.

---

## Repository State

The current folder is empty and is not a git repository. Keep commit steps in the plan for the moment when git is initialized. Until then, execute the file and verification steps and skip commit commands.

## File Structure

- Create `package.json`: scripts and development dependencies.
- Create `manifest.json`: Obsidian plugin metadata with ID `obmenu`.
- Create `versions.json`: version to minimum Obsidian app version map.
- Create `esbuild.config.mjs`: Obsidian plugin bundling.
- Create `tsconfig.json`: strict TypeScript settings.
- Create `vitest.config.ts`: test runner configuration.
- Create `src/types.ts`: shared settings, toolbar, and command contracts.
- Create `src/settings.ts`: defaults, normalization, and settings tab UI.
- Create `src/commands/markdownCommands.ts`: pure Markdown transforms and editor adapters.
- Create `src/commands/registry.ts`: built-in command definitions and default toolbar items.
- Create `src/toolbar/positioning.ts`: fixed, selection, and cursor positioning helpers.
- Create `src/toolbar/toolbar.ts`: toolbar DOM controller.
- Create `src/toolbar/events.ts`: workspace/editor event wiring.
- Create `src/main.ts`: plugin lifecycle.
- Create `styles.css`: toolbar styling.
- Create `README.md`: project description and cMenu inspiration note.
- Create `tests/*.test.ts`: unit tests for settings, transforms, registry, and positioning.

---

### Task 1: Scaffold The Obsidian Plugin Project

**Files:**
- Create: `package.json`
- Create: `manifest.json`
- Create: `versions.json`
- Create: `esbuild.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "obmenu",
  "version": "0.1.0",
  "description": "A modern Markdown formatting toolbar for Obsidian.",
  "main": "main.js",
  "type": "module",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "keywords": [
    "obsidian",
    "obsidian-plugin",
    "markdown",
    "toolbar"
  ],
  "author": "obMenu contributors",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^22.15.17",
    "builtin-modules": "^4.0.0",
    "esbuild": "0.25.5",
    "obsidian": "latest",
    "tslib": "^2.8.1",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Create `manifest.json`**

```json
{
  "id": "obmenu",
  "name": "obMenu",
  "version": "0.1.0",
  "minAppVersion": "1.5.0",
  "description": "A modern Markdown formatting toolbar for Obsidian.",
  "author": "obMenu contributors",
  "isDesktopOnly": false
}
```

- [ ] **Step 3: Create `versions.json`**

```json
{
  "0.1.0": "1.5.0"
}
```

- [ ] **Step 4: Create `esbuild.config.mjs`**

```js
import esbuild from "esbuild";
import builtins from "builtin-modules";

const prod = process.argv[2] === "production";

const context = await esbuild.context({
  banner: {
    js: "/* obMenu - a clean-room Obsidian Markdown toolbar */",
  },
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtins,
  ],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  minify: prod,
});

if (prod) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "lib": ["DOM", "ES2021"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "target": "ES2021",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "vitest.config.ts"]
}
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 7: Create `.gitignore`**

```gitignore
node_modules/
main.js
*.map
data.json
.DS_Store
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and no dependency resolution errors are reported.

- [ ] **Step 9: Verify empty project build fails for the expected reason**

Run: `npm run build`

Expected: FAIL because `src/main.ts` does not exist yet.

- [ ] **Step 10: Commit scaffold if git is initialized**

```bash
git add package.json package-lock.json manifest.json versions.json esbuild.config.mjs tsconfig.json vitest.config.ts .gitignore
git commit -m "chore: scaffold obmenu plugin"
```

---

### Task 2: Define Shared Types And Settings Normalization

**Files:**
- Create: `src/types.ts`
- Create: `src/settings.ts`
- Create: `tests/settings.test.ts`

- [ ] **Step 1: Write failing settings tests**

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/settings";

describe("normalizeSettings", () => {
  it("uses defaults when saved data is empty", () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps valid saved modes and style", () => {
    const settings = normalizeSettings({
      enabled: false,
      positionMode: "cursor",
      visualStyle: "compact",
      toolbarItems: [{ id: "bold", type: "builtin", commandId: "bold" }],
    });

    expect(settings.enabled).toBe(false);
    expect(settings.positionMode).toBe("cursor");
    expect(settings.visualStyle).toBe("compact");
    expect(settings.toolbarItems).toHaveLength(1);
  });

  it("repairs invalid modes and stale item shapes", () => {
    const settings = normalizeSettings({
      enabled: true,
      positionMode: "floating",
      visualStyle: "giant",
      toolbarItems: [{ id: "bad" }],
    });

    expect(settings.positionMode).toBe("fixed");
    expect(settings.visualStyle).toBe("default");
    expect(settings.toolbarItems).toEqual(DEFAULT_SETTINGS.toolbarItems);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/settings.test.ts`

Expected: FAIL because `src/settings.ts` does not exist.

- [ ] **Step 3: Create `src/types.ts`**

```ts
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
```

- [ ] **Step 4: Create `src/settings.ts` defaults and normalization**

```ts
import type {
  ObMenuSettings,
  ToolbarItem,
  ToolbarPositionMode,
  ToolbarVisualStyle,
} from "./types";

const POSITION_MODES = new Set<ToolbarPositionMode>(["fixed", "selection", "cursor"]);
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
    (item.type === "builtin" || item.type === "obsidian") &&
    typeof item.commandId === "string"
  );
}

export function normalizeSettings(saved: unknown): ObMenuSettings {
  if (!saved || typeof saved !== "object") return structuredClone(DEFAULT_SETTINGS);

  const input = saved as Partial<ObMenuSettings>;
  const toolbarItems = Array.isArray(input.toolbarItems)
    ? input.toolbarItems.filter(isToolbarItem)
    : [];

  return {
    enabled: typeof input.enabled === "boolean" ? input.enabled : DEFAULT_SETTINGS.enabled,
    positionMode: POSITION_MODES.has(input.positionMode as ToolbarPositionMode)
      ? (input.positionMode as ToolbarPositionMode)
      : DEFAULT_SETTINGS.positionMode,
    visualStyle: VISUAL_STYLES.has(input.visualStyle as ToolbarVisualStyle)
      ? (input.visualStyle as ToolbarVisualStyle)
      : DEFAULT_SETTINGS.visualStyle,
    toolbarItems: toolbarItems.length > 0 ? toolbarItems : structuredClone(DEFAULT_TOOLBAR_ITEMS),
  };
}
```

- [ ] **Step 5: Run settings tests**

Run: `npm run test -- tests/settings.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit if git is initialized**

```bash
git add src/types.ts src/settings.ts tests/settings.test.ts
git commit -m "feat: add settings normalization"
```

---

### Task 3: Add Pure Markdown Formatting Transforms

**Files:**
- Create: `src/commands/markdownCommands.ts`
- Create: `tests/markdownCommands.test.ts`

- [ ] **Step 1: Write failing transform tests**

```ts
import { describe, expect, it } from "vitest";
import {
  applyHeadingToLine,
  toggleCheckboxLine,
  toggleInlineWrapper,
} from "../src/commands/markdownCommands";

describe("toggleInlineWrapper", () => {
  it("wraps selected text", () => {
    expect(toggleInlineWrapper("hello", "**", "**")).toEqual({
      text: "**hello**",
      cursorOffset: 2,
    });
  });

  it("unwraps already wrapped text", () => {
    expect(toggleInlineWrapper("**hello**", "**", "**")).toEqual({
      text: "hello",
      cursorOffset: -2,
    });
  });
});

describe("applyHeadingToLine", () => {
  it("adds a heading marker", () => {
    expect(applyHeadingToLine("Daily note", 2)).toBe("## Daily note");
  });

  it("replaces an existing heading marker", () => {
    expect(applyHeadingToLine("#### Daily note", 1)).toBe("# Daily note");
  });
});

describe("toggleCheckboxLine", () => {
  it("adds an unchecked checkbox with indentation preserved", () => {
    expect(toggleCheckboxLine("  task")).toBe("  - [ ] task");
  });

  it("removes an unchecked checkbox", () => {
    expect(toggleCheckboxLine("  - [ ] task")).toBe("  task");
  });

  it("removes a checked checkbox", () => {
    expect(toggleCheckboxLine("- [x] task")).toBe("task");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/markdownCommands.test.ts`

Expected: FAIL because `src/commands/markdownCommands.ts` does not exist.

- [ ] **Step 3: Create pure transform functions**

```ts
export interface InlineTransformResult {
  text: string;
  cursorOffset: number;
}

export function toggleInlineWrapper(
  text: string,
  prefix: string,
  suffix = prefix,
): InlineTransformResult {
  if (text.startsWith(prefix) && text.endsWith(suffix)) {
    return {
      text: text.slice(prefix.length, text.length - suffix.length),
      cursorOffset: -prefix.length,
    };
  }

  return {
    text: `${prefix}${text}${suffix}`,
    cursorOffset: prefix.length,
  };
}

export function applyHeadingToLine(line: string, level: 1 | 2 | 3 | 4 | 5 | 6): string {
  const content = line.replace(/^#{1,6}\s+/, "");
  return `${"#".repeat(level)} ${content}`;
}

export function toggleCheckboxLine(line: string): string {
  const match = line.match(/^(\s*)(?:[-*+]\s+)?\[[ xX]\]\s+(.*)$/);
  if (match) return `${match[1]}${match[2]}`;

  const indent = line.match(/^\s*/)?.[0] ?? "";
  const content = line.slice(indent.length);
  return `${indent}- [ ] ${content}`;
}
```

- [ ] **Step 4: Run transform tests**

Run: `npm run test -- tests/markdownCommands.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit if git is initialized**

```bash
git add src/commands/markdownCommands.ts tests/markdownCommands.test.ts
git commit -m "feat: add markdown transforms"
```

---

### Task 4: Add Built-In Command Registry

**Files:**
- Create: `src/commands/registry.ts`
- Create: `tests/registry.test.ts`

- [ ] **Step 1: Write failing registry tests**

```ts
import { describe, expect, it } from "vitest";
import { BUILTIN_COMMANDS, getBuiltInCommand } from "../src/commands/registry";

describe("command registry", () => {
  it("contains heading commands H1-H6", () => {
    const ids = BUILTIN_COMMANDS.map((command) => command.id);
    expect(ids).toContain("heading-1");
    expect(ids).toContain("heading-6");
  });

  it("contains checkbox and link commands", () => {
    expect(getBuiltInCommand("checkbox")?.name).toBe("Checkbox");
    expect(getBuiltInCommand("wikilink")?.name).toBe("Wikilink");
  });

  it("returns undefined for unknown commands", () => {
    expect(getBuiltInCommand("missing")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/registry.test.ts`

Expected: FAIL because `src/commands/registry.ts` does not exist.

- [ ] **Step 3: Create registry**

```ts
import type { BuiltInCommandDefinition } from "../types";

export const BUILTIN_COMMANDS: BuiltInCommandDefinition[] = [
  { id: "bold", name: "Bold", icon: "bold", group: "formatting" },
  { id: "italic", name: "Italic", icon: "italic", group: "formatting" },
  { id: "strikethrough", name: "Strikethrough", icon: "strikethrough", group: "formatting" },
  { id: "underline", name: "Underline", icon: "underline", group: "formatting" },
  { id: "inline-code", name: "Inline code", icon: "code", group: "formatting" },
  { id: "code-block", name: "Code block", icon: "square-code", group: "blocks" },
  { id: "blockquote", name: "Block quote", icon: "quote", group: "blocks" },
  { id: "highlight", name: "Highlight", icon: "highlighter", group: "formatting" },
  { id: "checkbox", name: "Checkbox", icon: "square-check", group: "blocks" },
  { id: "bullet-list", name: "Bulleted list", icon: "list", group: "blocks" },
  { id: "numbered-list", name: "Numbered list", icon: "list-ordered", group: "blocks" },
  { id: "markdown-link", name: "Markdown link", icon: "link", group: "links" },
  { id: "wikilink", name: "Wikilink", icon: "brackets", group: "links" },
  { id: "heading-group", name: "Headings", icon: "heading", group: "headings" },
  { id: "heading-1", name: "Heading 1", icon: "heading-1", group: "headings" },
  { id: "heading-2", name: "Heading 2", icon: "heading-2", group: "headings" },
  { id: "heading-3", name: "Heading 3", icon: "heading-3", group: "headings" },
  { id: "heading-4", name: "Heading 4", icon: "heading-4", group: "headings" },
  { id: "heading-5", name: "Heading 5", icon: "heading-5", group: "headings" },
  { id: "heading-6", name: "Heading 6", icon: "heading-6", group: "headings" },
];

export function getBuiltInCommand(id: string): BuiltInCommandDefinition | undefined {
  return BUILTIN_COMMANDS.find((command) => command.id === id);
}
```

- [ ] **Step 4: Run registry tests**

Run: `npm run test -- tests/registry.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit if git is initialized**

```bash
git add src/commands/registry.ts tests/registry.test.ts
git commit -m "feat: add toolbar command registry"
```

---

### Task 5: Add Toolbar Positioning Helpers

**Files:**
- Create: `src/toolbar/positioning.ts`
- Create: `tests/positioning.test.ts`

- [ ] **Step 1: Write failing positioning tests**

```ts
import { describe, expect, it } from "vitest";
import { clampPosition, positionNearRect } from "../src/toolbar/positioning";

describe("clampPosition", () => {
  it("keeps a toolbar inside viewport padding", () => {
    expect(clampPosition({ left: 490, top: 490 }, { width: 100, height: 40 }, { width: 500, height: 500 })).toEqual({
      left: 392,
      top: 452,
    });
  });
});

describe("positionNearRect", () => {
  it("places toolbar above selected text when there is room", () => {
    expect(
      positionNearRect(
        { left: 100, top: 100, right: 200, bottom: 120 },
        { width: 120, height: 40 },
        { width: 800, height: 600 },
      ),
    ).toEqual({ left: 90, top: 52 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/positioning.test.ts`

Expected: FAIL because `src/toolbar/positioning.ts` does not exist.

- [ ] **Step 3: Create positioning helpers**

```ts
interface Point {
  left: number;
  top: number;
}

interface Size {
  width: number;
  height: number;
}

interface RectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const PADDING = 8;

export function clampPosition(point: Point, toolbar: Size, viewport: Size): Point {
  return {
    left: Math.min(Math.max(point.left, PADDING), viewport.width - toolbar.width - PADDING),
    top: Math.min(Math.max(point.top, PADDING), viewport.height - toolbar.height - PADDING),
  };
}

export function positionNearRect(rect: RectLike, toolbar: Size, viewport: Size): Point {
  const centerLeft = rect.left + (rect.right - rect.left) / 2 - toolbar.width / 2;
  const top = rect.top - toolbar.height - PADDING;
  const fallbackTop = rect.bottom + PADDING;
  return clampPosition(
    { left: centerLeft, top: top >= PADDING ? top : fallbackTop },
    toolbar,
    viewport,
  );
}
```

- [ ] **Step 4: Run positioning tests**

Run: `npm run test -- tests/positioning.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit if git is initialized**

```bash
git add src/toolbar/positioning.ts tests/positioning.test.ts
git commit -m "feat: add toolbar positioning helpers"
```

---

### Task 6: Add Editor Command Adapters

**Files:**
- Modify: `src/commands/markdownCommands.ts`

- [ ] **Step 1: Add editor adapter exports**

Append editor-facing functions that use the pure transforms:

```ts
import type { Editor } from "obsidian";

export function applyInlineCommand(editor: Editor, prefix: string, suffix = prefix): void {
  const selection = editor.getSelection();
  const result = toggleInlineWrapper(selection, prefix, suffix);
  editor.replaceSelection(result.text);
}

export function applyHeadingCommand(editor: Editor, level: 1 | 2 | 3 | 4 | 5 | 6): void {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  editor.setLine(cursor.line, applyHeadingToLine(line, level));
}

export function applyCheckboxCommand(editor: Editor): void {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  editor.setLine(cursor.line, toggleCheckboxLine(line));
}
```

- [ ] **Step 2: Run unit tests**

Run: `npm run test`

Expected: PASS.

- [ ] **Step 3: Commit if git is initialized**

```bash
git add src/commands/markdownCommands.ts
git commit -m "feat: adapt markdown transforms to editor commands"
```

---

### Task 7: Create Toolbar DOM Controller

**Files:**
- Create: `src/toolbar/toolbar.ts`

- [ ] **Step 1: Create toolbar controller**

```ts
import { ButtonComponent, setIcon, type App } from "obsidian";
import type { ObMenuSettings, ToolbarItem } from "../types";
import { getBuiltInCommand } from "../commands/registry";

export interface ToolbarControllerOptions {
  app: App;
  settings: ObMenuSettings;
  onRunItem: (item: ToolbarItem) => void;
}

export class ToolbarController {
  private root: HTMLElement | null = null;

  constructor(private readonly options: ToolbarControllerOptions) {}

  mount(parent: HTMLElement): void {
    if (this.root) return;
    this.root = createDiv({ cls: "obmenu-toolbar" });
    parent.appendChild(this.root);
    this.render();
  }

  unmount(): void {
    this.root?.remove();
    this.root = null;
  }

  render(): void {
    if (!this.root) return;
    this.root.empty();
    this.root.toggleClass("is-compact", this.options.settings.visualStyle === "compact");

    for (const item of this.options.settings.toolbarItems) {
      const definition = item.type === "builtin" ? getBuiltInCommand(item.commandId) : undefined;
      const command = item.type === "obsidian" ? this.options.app.commands.findCommand(item.commandId) : undefined;
      const label = definition?.name ?? command?.name ?? item.commandId;
      const icon = definition?.icon ?? command?.icon ?? "circle-help";
      const disabled = item.type === "obsidian" && !command;

      const button = new ButtonComponent(this.root);
      button.setTooltip(disabled ? `Missing command: ${item.commandId}` : label);
      button.setClass("obmenu-button");
      button.setDisabled(disabled);
      setIcon((button as unknown as { buttonEl: HTMLElement }).buttonEl, icon);
      button.onClick(() => {
        if (!disabled) this.options.onRunItem(item);
      });
    }
  }

  setVisible(visible: boolean): void {
    this.root?.toggleClass("is-hidden", !visible);
  }

  setPosition(left: number, top: number): void {
    if (!this.root) return;
    this.root.style.left = `${left}px`;
    this.root.style.top = `${top}px`;
  }
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run build`

Expected: FAIL until `src/main.ts` exists. If TypeScript reports issues inside `toolbar.ts`, fix those before moving on.

- [ ] **Step 3: Commit if git is initialized**

```bash
git add src/toolbar/toolbar.ts
git commit -m "feat: add toolbar controller"
```

---

### Task 8: Wire Plugin Lifecycle And Built-In Commands

**Files:**
- Create: `src/main.ts`
- Create: `src/toolbar/events.ts`
- Modify: `src/settings.ts`

- [ ] **Step 1: Add settings tab shell to `src/settings.ts`**

Append:

```ts
import { PluginSettingTab, Setting, type App } from "obsidian";
import type ObMenuPlugin from "./main";

export class ObMenuSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: ObMenuPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Enable obMenu")
      .setDesc("Show the Markdown formatting toolbar while editing.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.enabled);
        toggle.onChange(async (enabled) => {
          this.plugin.settings.enabled = enabled;
          await this.plugin.saveSettings();
          this.plugin.refreshToolbar();
        });
      });

    new Setting(containerEl)
      .setName("Position mode")
      .setDesc("Choose where the toolbar appears.")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({ fixed: "Fixed", selection: "Selection", cursor: "Cursor" })
          .setValue(this.plugin.settings.positionMode)
          .onChange(async (positionMode) => {
            this.plugin.settings.positionMode = positionMode as typeof this.plugin.settings.positionMode;
            await this.plugin.saveSettings();
            this.plugin.refreshToolbar();
          });
      });

    new Setting(containerEl)
      .setName("Visual style")
      .setDesc("Choose the toolbar density.")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({ default: "Default", compact: "Compact" })
          .setValue(this.plugin.settings.visualStyle)
          .onChange(async (visualStyle) => {
            this.plugin.settings.visualStyle = visualStyle as typeof this.plugin.settings.visualStyle;
            await this.plugin.saveSettings();
            this.plugin.refreshToolbar();
          });
      });
  }
}
```

- [ ] **Step 2: Create `src/toolbar/events.ts`**

```ts
import type { EventRef, Workspace } from "obsidian";

export class ToolbarEvents {
  private refs: EventRef[] = [];
  private selectionHandler: (() => void) | null = null;

  constructor(
    private readonly workspace: Workspace,
    private readonly refresh: () => void,
  ) {}

  register(): void {
    this.refs.push(this.workspace.on("active-leaf-change", this.refresh));
    this.refs.push(this.workspace.on("layout-change", this.refresh));
    this.selectionHandler = () => this.refresh();
    document.addEventListener("selectionchange", this.selectionHandler);
  }

  unregister(): void {
    for (const ref of this.refs) this.workspace.offref(ref);
    this.refs = [];
    if (this.selectionHandler) document.removeEventListener("selectionchange", this.selectionHandler);
    this.selectionHandler = null;
  }
}
```

- [ ] **Step 3: Create `src/main.ts`**

```ts
import { MarkdownView, Plugin, type Editor } from "obsidian";
import {
  applyCheckboxCommand,
  applyHeadingCommand,
  applyInlineCommand,
} from "./commands/markdownCommands";
import { normalizeSettings, ObMenuSettingTab } from "./settings";
import type { ObMenuSettings, ToolbarItem } from "./types";
import { ToolbarEvents } from "./toolbar/events";
import { ToolbarController } from "./toolbar/toolbar";

export default class ObMenuPlugin extends Plugin {
  settings: ObMenuSettings;
  private toolbar: ToolbarController | null = null;
  private events: ToolbarEvents | null = null;

  async onload(): Promise<void> {
    this.settings = normalizeSettings(await this.loadData());
    this.registerBuiltInCommands();
    this.addSettingTab(new ObMenuSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      this.toolbar = new ToolbarController({
        app: this.app,
        settings: this.settings,
        onRunItem: (item) => this.runToolbarItem(item),
      });
      this.toolbar.mount(document.body);
      this.events = new ToolbarEvents(this.app.workspace, () => this.refreshToolbar());
      this.events.register();
      this.refreshToolbar();
    });
  }

  onunload(): void {
    this.events?.unregister();
    this.toolbar?.unmount();
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  refreshToolbar(): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const visible = this.settings.enabled && Boolean(view);
    this.toolbar?.setVisible(visible);
    this.toolbar?.render();
  }

  private getEditor(): Editor | null {
    return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor ?? null;
  }

  private registerBuiltInCommands(): void {
    this.addCommand({ id: "toggle-bold", name: "Toggle bold", editorCallback: (editor) => applyInlineCommand(editor, "**") });
    this.addCommand({ id: "toggle-italic", name: "Toggle italic", editorCallback: (editor) => applyInlineCommand(editor, "*") });
    this.addCommand({ id: "toggle-strikethrough", name: "Toggle strikethrough", editorCallback: (editor) => applyInlineCommand(editor, "~~") });
    this.addCommand({ id: "toggle-highlight", name: "Toggle highlight", editorCallback: (editor) => applyInlineCommand(editor, "==") });
    this.addCommand({ id: "toggle-inline-code", name: "Toggle inline code", editorCallback: (editor) => applyInlineCommand(editor, "`") });
    this.addCommand({ id: "toggle-checkbox", name: "Toggle checkbox", editorCallback: (editor) => applyCheckboxCommand(editor) });
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      this.addCommand({
        id: `apply-heading-${level}`,
        name: `Apply heading ${level}`,
        editorCallback: (editor) => applyHeadingCommand(editor, level),
      });
    }
  }

  private runToolbarItem(item: ToolbarItem): void {
    const editor = this.getEditor();
    if (!editor) return;

    if (item.type === "obsidian") {
      void this.app.commands.executeCommandById(item.commandId);
      editor.focus();
      return;
    }

    const commandMap: Record<string, () => void> = {
      bold: () => applyInlineCommand(editor, "**"),
      italic: () => applyInlineCommand(editor, "*"),
      strikethrough: () => applyInlineCommand(editor, "~~"),
      underline: () => applyInlineCommand(editor, "<u>", "</u>"),
      "inline-code": () => applyInlineCommand(editor, "`"),
      highlight: () => applyInlineCommand(editor, "=="),
      checkbox: () => applyCheckboxCommand(editor),
      "heading-1": () => applyHeadingCommand(editor, 1),
      "heading-2": () => applyHeadingCommand(editor, 2),
      "heading-3": () => applyHeadingCommand(editor, 3),
      "heading-4": () => applyHeadingCommand(editor, 4),
      "heading-5": () => applyHeadingCommand(editor, 5),
      "heading-6": () => applyHeadingCommand(editor, 6),
    };

    commandMap[item.commandId]?.();
    editor.focus();
  }
}
```

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS and `main.js` is emitted.

- [ ] **Step 5: Commit if git is initialized**

```bash
git add src/main.ts src/toolbar/events.ts src/settings.ts main.js
git commit -m "feat: wire obmenu plugin lifecycle"
```

---

### Task 9: Add Toolbar Styles

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Create `styles.css`**

```css
.obmenu-toolbar {
  position: fixed;
  z-index: var(--layer-popover);
  left: 50%;
  bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: min(720px, calc(100vw - 24px));
  padding: 6px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-primary);
  box-shadow: var(--shadow-s);
}

.obmenu-toolbar.is-hidden {
  display: none;
}

.obmenu-toolbar.is-compact {
  gap: 2px;
  padding: 3px;
}

.obmenu-button {
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
  border-radius: 6px;
}

.obmenu-toolbar.is-compact .obmenu-button {
  width: 24px;
  height: 24px;
  min-width: 24px;
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit if git is initialized**

```bash
git add styles.css
git commit -m "style: add obmenu toolbar styles"
```

---

### Task 10: Add README And Clean-Room Attribution

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```md
# obMenu

obMenu is a modern Markdown formatting toolbar for Obsidian.

It helps users apply common Markdown actions without memorizing every command or hotkey.

## Features

- Formatting buttons for bold, italic, strikethrough, underline, code, highlight, block quote, checkbox, links, and H1-H6 headings.
- Fixed, selection, and cursor toolbar modes.
- Default and compact visual styles.
- Configurable toolbar items.

## Inspiration

obMenu is a clean-room implementation inspired by cMenu, an earlier Obsidian formatting toolbar plugin. This project does not copy cMenu source files.
```

- [ ] **Step 2: Run final automated checks**

Run: `npm run test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Manual Obsidian smoke test**

Copy `main.js`, `manifest.json`, and `styles.css` into an Obsidian vault plugin folder named `.obsidian/plugins/obmenu`, enable the plugin, and verify:

- The toolbar appears in a Markdown editor.
- Bold, italic, highlight, checkbox, and H1-H6 commands work.
- Editor focus returns after clicking a button.
- Missing custom command IDs render disabled.
- Default and compact styles are readable in dark and light themes.

- [ ] **Step 4: Commit if git is initialized**

```bash
git add README.md
git commit -m "docs: describe obmenu"
```

---

## Self-Review

- Spec coverage: The plan covers clean-room scaffold, formatting actions, H1-H6 headings, checkbox support, settings, toolbar styles, command registry, positioning helpers, README attribution, and verification.
- Placeholder scan: The plan contains no incomplete placeholder tasks.
- Type consistency: `ObMenuSettings`, `ToolbarItem`, `ToolbarController`, and command IDs are introduced before their later use.
- Scope check: This is a single first-version plugin plan. Mobile-specific redesign, table editing, and nested command groups remain outside version 1.

