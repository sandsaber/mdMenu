import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/settings";

describe("normalizeSettings", () => {
  it("uses cloned defaults when saved data is empty", () => {
    const settings = normalizeSettings(null);

    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings).not.toBe(DEFAULT_SETTINGS);
    expect(settings.toolbarItems).not.toBe(DEFAULT_SETTINGS.toolbarItems);
  });

  it("keeps valid saved modes, style, and toolbar items", () => {
    const toolbarItems = [{ id: "bold", type: "builtin", commandId: "bold" }];
    const settings = normalizeSettings({
      enabled: false,
      positionMode: "manual",
      visualStyle: "compact",
      manualPosition: { left: 123, top: 234 },
      toolbarItems,
    });

    expect(settings).toEqual({
      enabled: false,
      positionMode: "manual",
      visualStyle: "compact",
      manualPosition: { left: 123, top: 234 },
      toolbarItems,
    });
  });

  it("keeps separator toolbar items", () => {
    const toolbarItems = [{ id: "sep-headings", type: "separator" }];
    const settings = normalizeSettings({ toolbarItems });

    expect(settings.toolbarItems).toEqual(toolbarItems);
  });

  it("keeps an intentionally empty toolbar", () => {
    const settings = normalizeSettings({ toolbarItems: [] });

    expect(settings.toolbarItems).toEqual([]);
  });

  it("repairs invalid modes, style, and stale item shapes", () => {
    const settings = normalizeSettings({
      enabled: true,
      positionMode: "floating",
      visualStyle: "giant",
      manualPosition: { left: Number.NaN, top: "12" },
      toolbarItems: [{ id: "bad" }],
    });

    expect(settings.positionMode).toBe("fixed");
    expect(settings.visualStyle).toBe("default");
    expect(settings.manualPosition).toBeNull();
    expect(settings.toolbarItems).toEqual(DEFAULT_SETTINGS.toolbarItems);
  });

  it("rejects empty toolbar item identifiers", () => {
    const settings = normalizeSettings({
      toolbarItems: [
        { id: "", type: "builtin", commandId: "bold" },
        { id: "blank-command", type: "builtin", commandId: "   " },
      ],
    });

    expect(settings.toolbarItems).toEqual(DEFAULT_SETTINGS.toolbarItems);
  });

  it("uses H1-H4, lists, markdown links, separators, callouts, and clear formatting by default", () => {
    const commandIds = DEFAULT_SETTINGS.toolbarItems.map((item) =>
      item.type === "separator" ? item.id : item.commandId,
    );

    expect(commandIds).toEqual([
      "bold",
      "italic",
      "strikethrough",
      "highlight",
      "inline-code",
      "clear-formatting",
      "sep-headings",
      "heading-1",
      "heading-2",
      "heading-3",
      "heading-4",
      "sep-blocks",
      "checkbox",
      "bullet-list",
      "numbered-list",
      "blockquote",
      "callout",
      "sep-links",
      "markdown-link",
      "wikilink",
    ]);
  });
});
