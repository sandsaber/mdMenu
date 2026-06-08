import { PluginSettingTab, Setting, type App } from "obsidian";
import { DEFAULT_TOOLBAR_ITEMS } from "./settings";
import type ObMenuPlugin from "./main";
import type { ToolbarPositionMode, ToolbarVisualStyle } from "./types";

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
          .addOptions({
            fixed: "Fixed",
            selection: "Selection",
            cursor: "Cursor",
          })
          .setValue(this.plugin.settings.positionMode)
          .onChange(async (positionMode) => {
            this.plugin.settings.positionMode =
              positionMode as ToolbarPositionMode;
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
            this.plugin.settings.visualStyle = visualStyle as ToolbarVisualStyle;
            await this.plugin.saveSettings();
            this.plugin.refreshToolbar();
          });
      });

    new Setting(containerEl)
      .setName("Reset toolbar")
      .setDesc("Restore the default obMenu toolbar items.")
      .addButton((button) => {
        button.setButtonText("Reset").onClick(async () => {
          this.plugin.settings.toolbarItems = structuredClone(
            DEFAULT_TOOLBAR_ITEMS,
          );
          await this.plugin.saveSettings();
          this.plugin.refreshToolbar();
          this.display();
        });
      });

    new Setting(containerEl)
      .setName("Toolbar items")
      .setDesc(
        this.plugin.settings.toolbarItems
          .map((item) => `${item.type}:${item.commandId}`)
          .join(", "),
      );
  }
}
