# obMenu

obMenu is a modern Markdown formatting toolbar for Obsidian.

It gives writers a compact editing toolbar for common Markdown actions while keeping the editor focused and the cursor where typing should continue.

> Status: pre-release. The core toolbar, formatting commands, settings, tests, and local release build are in place. The plugin is not published to the Obsidian community plugin directory yet.

## Features

### Markdown Formatting

- Bold
- Italic
- Strikethrough
- Underline
- Highlight
- Inline code
- Code block
- Block quote
- Checkbox
- Bulleted list
- Numbered list
- Markdown link
- Wikilink
- Headings H1-H6

### Heading Menu

The default toolbar includes a grouped heading action. Clicking it opens a menu for H1 through H6, so the toolbar stays compact without losing direct heading controls.

### Toolbar Placement

obMenu supports three placement modes:

- `fixed`: keeps the toolbar at the bottom of the workspace.
- `selection`: shows the toolbar near selected text.
- `cursor`: positions the toolbar near the current editor selection/caret when a measurable browser selection rect is available.

Contextual placement is clamped to the viewport and includes safeguards for small windows and oversized toolbars.

### Visual Styles

- `default`: Obsidian-native toolbar density.
- `compact`: smaller buttons for a tighter writing surface.

Both styles use Obsidian theme variables and work with light and dark themes.

### Settings

The settings tab currently supports:

- Enabling or disabling the toolbar.
- Choosing the placement mode.
- Choosing the visual style.
- Resetting toolbar items to defaults.
- Viewing the current toolbar item list.

The settings model is normalized on load, so stale or malformed saved data falls back to safe defaults.

### Editor Behavior

- Toolbar actions refocus the active Markdown editor.
- Empty inline-format actions place the cursor between inserted markers.
- Existing inline wrappers can be removed by toggling the same wrapper around selected text.
- Checkbox toggling preserves indentation and handles empty checked or unchecked task items.

## Installation

obMenu is currently installed manually from a local release build.

Build the release folder:

```bash
npm run build:dist
```

Copy the generated folder:

```text
dist/obmenu
```

to your vault:

```text
.obsidian/plugins/obmenu
```

Then enable `obMenu` from Obsidian's community plugin settings.

## Release Build

`npm run build:dist` creates a clean release folder:

```text
dist/obmenu/main.js
dist/obmenu/manifest.json
dist/obmenu/styles.css
dist/obmenu/LICENSE
```

`dist/` is intentionally ignored by Git. Rebuild it whenever you want a fresh copyable plugin folder.

## Development

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm run test
```

Build the root plugin bundle:

```bash
npm run build
```

Build the copyable release folder:

```bash
npm run build:dist
```

## Validation

The current automated checks cover:

- Settings normalization.
- Markdown transform behavior.
- H1-H6 heading application.
- Checkbox edge cases.
- Toolbar command registry.
- Contextual toolbar positioning.

Recommended pre-release checks:

```bash
npm run test
npm run build
npm run build:dist
npm audit --omit=dev
```

## Roadmap

Planned follow-up work:

- Drag-and-drop toolbar item ordering.
- UI for adding and removing custom Obsidian commands.
- More precise cursor geometry when Obsidian exposes a stable editor-coordinate API.
- Manual smoke-test notes for common Obsidian themes and vault layouts.
- Release automation for packaged plugin artifacts.

## Privacy

obMenu runs locally inside Obsidian. It does not send notes, selections, settings, or telemetry to any external service.

## Inspiration

obMenu is a clean-room implementation inspired by cMenu, an earlier Obsidian formatting toolbar plugin. This project does not copy cMenu source files.

## License

MIT License. Copyright (c) 2026 Michael Makarov.
