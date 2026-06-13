import esbuild from "esbuild";
import { builtinModules } from "node:module";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const distDir = "dist/mdmenu";
const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await esbuild.build({
  banner: {
    js: "/* mdMenu - a clean-room Obsidian Markdown toolbar */",
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
    ...nodeBuiltins,
  ],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: false,
  treeShaking: true,
  outfile: join(distDir, "main.js"),
  minify: true,
});

await Promise.all([
  copyFile("manifest.json", join(distDir, "manifest.json")),
  copyFile("styles.css", join(distDir, "styles.css")),
  copyFile("LICENSE", join(distDir, "LICENSE")),
]);
