# AGENTS.md

This file is the canonical project guide for coding agents working on obMenu.

## Project

obMenu is a clean-room Obsidian plugin that provides a compact, mini WYSIWYG-style Markdown formatting toolbar while keeping notes as plain Markdown.

The implementation is inspired by cMenu as a product idea, but it must not copy cMenu source files.

## Commands

Install dependencies:

```bash
npm install
```

Run unit tests:

```bash
npm run test
```

Run lint checks:

```bash
npm run lint
```

Run TypeScript checks:

```bash
npm run typecheck
```

Build the root Obsidian plugin bundle:

```bash
npm run build
```

Build the copyable release folder:

```bash
npm run build:dist
```

Run the production dependency audit:

```bash
npm run audit
```

Run the full pre-release gate:

```bash
npm run check
```

## Release Artifacts

`npm run build:dist` creates:

```text
dist/obmenu/main.js
dist/obmenu/manifest.json
dist/obmenu/styles.css
dist/obmenu/LICENSE
```

`dist/` is ignored by Git. Rebuild it whenever a fresh copyable plugin folder is needed.

## Release Workflow

- `.github/workflows/release.yml` follows the Grimoire-style tag release flow.
- Release tags use `x.y.z` without a `v` prefix.
- The workflow must verify that the tag matches `package.json` and `dist/obmenu/manifest.json`.
- Release assets are `dist/obmenu/main.js`, `dist/obmenu/manifest.json`, and `dist/obmenu/styles.css`.
- Keep `actions/attest` enabled for release assets.

## Community Plugin Review

- `manifest.json` description must not include the word "Obsidian"; the plugin directory context already implies it.
- GitHub release assets should include artifact attestations for `main.js`, `manifest.json`, and `styles.css` so users can verify provenance from the source repository.

## Architecture

- `src/main.ts`: plugin lifecycle, command registration, toolbar execution, settings wiring.
- `src/settings.ts`: pure settings defaults and normalization.
- `src/settingsTab.ts`: Obsidian settings tab UI.
- `src/commands/markdownCommands.ts`: pure Markdown transforms and editor adapters.
- `src/commands/registry.ts`: built-in toolbar command definitions.
- `src/toolbar/toolbar.ts`: toolbar DOM controller.
- `src/toolbar/events.ts`: workspace and DOM event wiring.
- `src/toolbar/positioning.ts`: pure viewport positioning helpers.
- `tests/`: Vitest coverage for pure behavior and normalization.
- `scripts/build-dist.mjs`: release folder builder.

## Development Notes

- Keep documentation and project-facing text in English.
- Keep `settings.ts` free of runtime Obsidian imports so tests can import it without resolving the Obsidian runtime package.
- Prefer pure functions for Markdown transforms and positioning before wiring them into Obsidian APIs.
- Toolbar separators are settings items with `type: "separator"` and no `commandId`.
- Manual toolbar placement stores `manualPosition`; clamp positions at render time without overwriting the saved coordinates unless the user drags the handle.
- Keep generated artifacts out of Git unless a release workflow explicitly requires them.
- Run `npm run check` before pushing release-related changes.

## License

MIT License. Copyright (c) 2026 Michael Makarov.
