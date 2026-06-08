# obMenu Design Spec

## Decision

Build `obMenu` as a new Obsidian plugin from scratch. The project may reference cMenu's product idea, behavior, and public pull request discussions, but it must not copy cMenu source files into the implementation.

The README should later include a short attribution line:

> obMenu is inspired by cMenu, an earlier Obsidian formatting toolbar plugin.

This keeps the implementation clean while respecting the cMenu project's MPL-2.0 license.

## Goal

Create a modern Markdown formatting toolbar for Obsidian that helps users edit notes without memorizing commands or hotkeys.

## Product Shape

`obMenu` appears while editing Markdown. It exposes common formatting actions as compact icon buttons and can also run selected Obsidian commands.

The first version focuses on editing ergonomics:

- Keep editor focus after every toolbar action.
- Preserve or restore cursor placement in a predictable way.
- Work with selected text and empty selections.
- Let users choose which buttons appear and in what order.
- Provide a fixed toolbar and a contextual toolbar mode near the selection or cursor.

## Formatting Scope

Version 1 supports these Markdown and editor actions:

- Bold
- Italic
- Strikethrough
- Underline
- Inline code
- Code block
- Block quote
- Highlight
- Checkbox
- Bulleted list
- Numbered list
- Markdown link
- Wikilink
- Headings H1-H6

Heading controls should be exposed as a grouped action rather than six always-visible buttons by default. The command registry should still support individual H1-H6 commands so users can pin any specific level.

## Toolbar Modes

`obMenu` supports three position modes:

- `fixed`: a stable toolbar at the bottom of the workspace.
- `selection`: a toolbar that appears near selected text.
- `cursor`: a toolbar that appears near the active editor cursor.

The `selection` and `cursor` modes should clamp inside the viewport and avoid covering the selected text when possible.

## Visual Styles

Version 1 includes two styles:

- `default`: a modern Obsidian-native toolbar using theme variables.
- `compact`: a smaller button density for users who want a tiny toolbar.

The visual language should be restrained, readable, and theme-compatible. Avoid large decorative surfaces. Icons should use Obsidian/Lucide-style icon names where available.

## Settings

The settings tab should support:

- Enable or disable the toolbar.
- Choose position mode.
- Choose visual style.
- Reorder toolbar items.
- Add an Obsidian command to the toolbar.
- Remove toolbar items.
- Reset to defaults.

Settings should be serializable as simple JSON and tolerate missing or stale command IDs.

## Architecture

The implementation should use the current Obsidian sample plugin style:

- TypeScript
- esbuild
- no React runtime
- modular source files
- CSS based on Obsidian theme variables

Core units:

- `src/main.ts`: plugin lifecycle, settings load/save, command registration.
- `src/settings.ts`: settings schema, defaults, normalization, settings tab UI.
- `src/commands/markdownCommands.ts`: pure formatting transforms and editor-facing command handlers.
- `src/commands/registry.ts`: toolbar item definitions, default items, command lookup.
- `src/toolbar/toolbar.ts`: creates and updates toolbar DOM.
- `src/toolbar/positioning.ts`: calculates fixed, selection, and cursor positions.
- `src/toolbar/events.ts`: editor/workspace event wiring and cleanup.
- `src/types.ts`: shared typed contracts.

## Data Flow

On load:

1. Load saved settings.
2. Normalize settings against current defaults.
3. Register built-in obMenu commands.
4. Create toolbar controller.
5. Listen for active editor, selection, layout, and settings changes.

On toolbar click:

1. Resolve toolbar item.
2. Run either a built-in formatting command or an Obsidian command ID.
3. Refocus editor.
4. Refresh toolbar visibility and position.

## Error Handling

- If no Markdown editor is active, hide the toolbar.
- If a custom Obsidian command no longer exists, keep the setting but render it disabled with a clear tooltip.
- If the editor selection cannot be measured, fall back from `selection` or `cursor` mode to `fixed` positioning for that update.
- If a formatting command cannot safely transform text, leave the document unchanged.

## Testing

Unit tests should cover pure Markdown transforms first:

- Toggle inline wrappers around selected text.
- Remove existing wrappers.
- Apply H1-H6 prefixes.
- Replace an existing heading level.
- Toggle checkbox markers.
- Preserve indentation for checkbox and list commands.

Integration-level tests can be lightweight at first:

- Settings normalization.
- Toolbar registry defaults.
- Disabled rendering for stale command IDs.

Manual verification in Obsidian should cover:

- Fixed toolbar.
- Selection toolbar.
- Cursor toolbar.
- Dark and light themes.
- Default and compact style.
- Commands with selected text and empty selection.

## Non-Goals For Version 1

- No copied cMenu source code.
- No React UI layer.
- No mobile-specific toolbar redesign.
- No table editor beyond basic Markdown commands.
- No nested toolbar groups beyond a simple heading group.
- No command palette replacement.

