import { describe, expect, it } from "vitest";
import type { Editor } from "obsidian";
import {
  applyInlineCommand,
  applyHeadingToLine,
  toggleCheckboxLine,
  toggleInlineWrapper,
} from "../src/commands/markdownCommands";

describe("toggleInlineWrapper", () => {
  it("wraps unwrapped text and moves the cursor inside the suffix", () => {
    expect(toggleInlineWrapper("hello", "**", "**")).toEqual({
      text: "**hello**",
      cursorOffset: 2,
    });
  });

  it("unwraps already wrapped text and moves the cursor back", () => {
    expect(toggleInlineWrapper("**hello**", "**", "**")).toEqual({
      text: "hello",
      cursorOffset: -2,
    });
  });
});

describe("applyHeadingToLine", () => {
  it("applies a heading marker to plain text", () => {
    expect(applyHeadingToLine("Daily note", 2)).toBe("## Daily note");
  });

  it("replaces an existing heading marker", () => {
    expect(applyHeadingToLine("#### Daily note", 1)).toBe("# Daily note");
  });

  it.each([
    [1, "# Daily note"],
    [2, "## Daily note"],
    [3, "### Daily note"],
    [4, "#### Daily note"],
    [5, "##### Daily note"],
    [6, "###### Daily note"],
  ] as const)("applies H%s to plain text", (level, expected) => {
    expect(applyHeadingToLine("Daily note", level)).toBe(expected);
  });

  it.each([
    [1, "# Daily note"],
    [2, "## Daily note"],
    [3, "### Daily note"],
    [4, "#### Daily note"],
    [5, "##### Daily note"],
    [6, "###### Daily note"],
  ] as const)("replaces an existing heading with H%s", (level, expected) => {
    expect(applyHeadingToLine("#### Daily note", level)).toBe(expected);
  });
});

describe("toggleCheckboxLine", () => {
  it("adds an unchecked checkbox after indentation", () => {
    expect(toggleCheckboxLine("  task")).toBe("  - [ ] task");
  });

  it("removes an unchecked checkbox while preserving indentation", () => {
    expect(toggleCheckboxLine("  - [ ] task")).toBe("  task");
  });

  it("removes a checked checkbox", () => {
    expect(toggleCheckboxLine("- [x] task")).toBe("task");
  });

  it("removes an empty unchecked checkbox", () => {
    expect(toggleCheckboxLine("- [ ]")).toBe("");
  });

  it("removes an empty checked checkbox", () => {
    expect(toggleCheckboxLine("- [x]")).toBe("");
  });
});

describe("applyInlineCommand", () => {
  it("moves the cursor between inserted wrappers for an empty selection", () => {
    const calls: unknown[] = [];
    const editor = {
      getCursor: () => ({ line: 3, ch: 8 }),
      getSelection: () => "",
      replaceSelection: (text: string) => calls.push(["replaceSelection", text]),
      setCursor: (line: number, ch: number) => calls.push(["setCursor", line, ch]),
    };

    applyInlineCommand(editor as unknown as Editor, "**");

    expect(calls).toEqual([
      ["replaceSelection", "****"],
      ["setCursor", 3, 10],
    ]);
  });
});
