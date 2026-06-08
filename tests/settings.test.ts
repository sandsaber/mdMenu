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
      positionMode: "cursor",
      visualStyle: "compact",
      toolbarItems,
    });

    expect(settings).toEqual({
      enabled: false,
      positionMode: "cursor",
      visualStyle: "compact",
      toolbarItems,
    });
  });

  it("repairs invalid modes, style, and stale item shapes", () => {
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

  it("rejects empty toolbar item identifiers", () => {
    const settings = normalizeSettings({
      toolbarItems: [
        { id: "", type: "builtin", commandId: "bold" },
        { id: "blank-command", type: "builtin", commandId: "   " },
      ],
    });

    expect(settings.toolbarItems).toEqual(DEFAULT_SETTINGS.toolbarItems);
  });
});
