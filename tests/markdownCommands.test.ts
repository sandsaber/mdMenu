import { describe, expect, it } from "vitest";
import type { Editor } from "obsidian";
import {
  applyCalloutToLine,
  applyCodeBlockCommand,
  applyHeadingCommand,
  applyInlineCommand,
  applyHeadingToLine,
  applyHeadingToText,
  clearInlineFormatting,
  toggleCalloutBlock,
  toggleCheckboxLine,
  toggleCheckboxText,
  toggleFencedCodeBlock,
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

describe("applyHeadingToText", () => {
  it("applies a heading to every selected line", () => {
    expect(applyHeadingToText("One\n### Two", 2)).toBe("## One\n## Two");
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

describe("toggleCheckboxText", () => {
  it("toggles every selected line independently", () => {
    expect(toggleCheckboxText("one\n- [x] two")).toBe("- [ ] one\ntwo");
  });
});

describe("applyCalloutToLine", () => {
  it("wraps a plain line in a note callout", () => {
    expect(applyCalloutToLine("Remember this")).toBe("> [!note] Remember this");
  });

  it("removes an existing callout marker", () => {
    expect(applyCalloutToLine("> [!tip] Remember this")).toBe("Remember this");
  });

  it("keeps empty callouts tidy", () => {
    expect(applyCalloutToLine("")).toBe("> [!note]");
  });
});

describe("toggleCalloutBlock", () => {
  it("wraps a multiline selection as one callout", () => {
    expect(toggleCalloutBlock("First\nSecond\n")).toBe(
      "> [!note] First\n> Second\n>",
    );
  });

  it("unwraps a multiline callout", () => {
    expect(toggleCalloutBlock("> [!tip] First\n> Second\n>")).toBe(
      "First\nSecond\n",
    );
  });
});

describe("toggleFencedCodeBlock", () => {
  it("wraps and unwraps fenced code", () => {
    const fenced = "```\nconst value = 1;\n```";

    expect(toggleFencedCodeBlock("const value = 1;")).toBe(fenced);
    expect(toggleFencedCodeBlock(fenced)).toBe("const value = 1;");
  });
});

describe("clearInlineFormatting", () => {
  it("removes common inline wrappers from selected Markdown", () => {
    expect(
      clearInlineFormatting(
        "**bold** *italic* ~~gone~~ ==bright== `code` <u>under</u>",
      ),
    ).toBe("bold italic gone bright code under");
  });

  it("leaves plain text alone", () => {
    expect(clearInlineFormatting("plain text")).toBe("plain text");
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

describe("multiline editor commands", () => {
  it("expands a partial selection to full lines for headings", () => {
    const calls: unknown[] = [];
    const lines = ["One", "Two", "Three"];
    const editor = {
      getSelection: () => "ne\nTw",
      getCursor: (side?: "from" | "to") =>
        side === "to" ? { line: 1, ch: 2 } : { line: 0, ch: 1 },
      getLine: (line: number) => lines[line],
      replaceRange: (...args: unknown[]) => calls.push(["replaceRange", ...args]),
      setSelection: (...args: unknown[]) => calls.push(["setSelection", ...args]),
    };

    applyHeadingCommand(editor as unknown as Editor, 1);

    expect(calls).toEqual([
      [
        "replaceRange",
        "# One\n# Two",
        { line: 0, ch: 0 },
        { line: 1, ch: 3 },
      ],
      ["setSelection", { line: 0, ch: 0 }, { line: 1, ch: 5 }],
    ]);
  });

  it("places the cursor inside an empty fenced code block", () => {
    const calls: unknown[] = [];
    const editor = {
      getSelection: () => "",
      getCursor: () => ({ line: 2, ch: 0 }),
      getLine: () => "",
      replaceSelection: (text: string) => calls.push(["replaceSelection", text]),
      setCursor: (line: number, ch: number) => calls.push(["setCursor", line, ch]),
    };

    applyCodeBlockCommand(editor as unknown as Editor);

    expect(calls).toEqual([
      ["replaceSelection", "```\n\n```"],
      ["setCursor", 3, 0],
    ]);
  });
});
