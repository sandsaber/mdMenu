import { describe, expect, it } from "vitest";
import { BUILTIN_COMMANDS, getBuiltInCommand } from "../src/commands/registry";

describe("BUILTIN_COMMANDS", () => {
  it("contains the first and last heading commands", () => {
    const commandIds = BUILTIN_COMMANDS.map((command) => command.id);

    expect(commandIds).toContain("heading-1");
    expect(commandIds).toContain("heading-6");
  });

  it("contains the full version-one command set with unique ids", () => {
    const commandIds = BUILTIN_COMMANDS.map((command) => command.id);

    expect(commandIds).toEqual([
      "bold",
      "italic",
      "strikethrough",
      "underline",
      "inline-code",
      "code-block",
      "blockquote",
      "highlight",
      "checkbox",
      "bullet-list",
      "numbered-list",
      "markdown-link",
      "wikilink",
      "heading-group",
      "heading-1",
      "heading-2",
      "heading-3",
      "heading-4",
      "heading-5",
      "heading-6",
    ]);
    expect(new Set(commandIds).size).toBe(commandIds.length);
  });

  it("uses only allowed command groups", () => {
    const allowedGroups = new Set(["formatting", "headings", "blocks", "links"]);

    for (const command of BUILTIN_COMMANDS) {
      expect(allowedGroups.has(command.group ?? "")).toBe(true);
    }
  });
});

describe("getBuiltInCommand", () => {
  it("returns built-in commands by id", () => {
    expect(getBuiltInCommand("checkbox")?.name).toBe("Checkbox");
    expect(getBuiltInCommand("wikilink")?.name).toBe("Wikilink");
  });

  it("returns undefined for unknown commands", () => {
    expect(getBuiltInCommand("missing")).toBeUndefined();
  });
});
