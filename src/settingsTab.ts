import { PluginSettingTab, Setting, type App } from "obsidian";
import { BUILTIN_COMMANDS, getBuiltInCommand } from "./commands/registry";
import { DEFAULT_TOOLBAR_ITEMS, TOOLBAR_PRESETS } from "./settings";
import type MdMenuPlugin from "./main";
import type {
  ToolbarItem,
  ToolbarPositionMode,
  ToolbarPresetId,
  ToolbarVisualStyle,
} from "./types";

function describeToolbarItem(item: ToolbarItem): string {
  if (item.type === "separator") return "Separator";

  if (item.type === "builtin" && item.commandId) {
    return getBuiltInCommand(item.commandId)?.name ?? item.commandId;
  }

  return item.commandId ?? item.id;
}

function describeToolbarItemType(item: ToolbarItem): string {
  if (item.type === "separator") return "Visual divider";
  if (item.type === "builtin") return "Built-in action";

  return "Obsidian command";
}

export class MdMenuSettingTab extends PluginSettingTab {
  private draggedToolbarIndex: number | null = null;

  constructor(app: App, private readonly plugin: MdMenuPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Enable mdMenu")
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
            manual: "Manual",
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
      .setName("Reset manual position")
      .setDesc("Move the draggable toolbar back to its default position.")
      .addButton((button) => {
        button.setIcon("rotate-ccw").setTooltip("Reset position");
        button.onClick(async () => {
          this.plugin.settings.manualPosition = null;
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
      .setName("Toolbar preset")
      .setDesc("Replace the current toolbar with a focused button set.")
      .addDropdown((dropdown) => {
        dropdown.addOption("", "Choose preset");
        for (const preset of TOOLBAR_PRESETS) {
          dropdown.addOption(preset.id, preset.name);
        }
        dropdown.setValue("");
        dropdown.onChange(async (presetId) => {
          const preset = TOOLBAR_PRESETS.find(
            (candidate) => candidate.id === (presetId as ToolbarPresetId),
          );
          if (!preset) return;

          this.plugin.settings.toolbarItems = structuredClone(preset.items);
          if (preset.id === "compact") {
            this.plugin.settings.visualStyle = "compact";
          }
          await this.plugin.saveSettings();
          this.plugin.refreshToolbar();
          this.update();
        });
      });

    this.renderAddButtonSetting(containerEl);

    new Setting(containerEl)
      .setName("Add separator")
      .setDesc("Insert a visual divider at the end of the toolbar.")
      .addButton((button) => {
        button.setIcon("separator-horizontal").setTooltip("Add separator");
        button.onClick(async () => {
          this.plugin.settings.toolbarItems = [
            ...this.plugin.settings.toolbarItems,
            { id: this.nextSeparatorId(), type: "separator" },
          ];
          await this.plugin.saveSettings();
          this.plugin.refreshToolbar();
          this.update();
        });
      });

    new Setting(containerEl)
      .setName("Reset toolbar")
      .setDesc("Restore the default mdMenu toolbar items.")
      .addButton((button) => {
        button.setIcon("undo-2").setTooltip("Reset toolbar").onClick(async () => {
          this.plugin.settings.toolbarItems = structuredClone(
            DEFAULT_TOOLBAR_ITEMS,
          );
          await this.plugin.saveSettings();
          this.plugin.refreshToolbar();
          this.update();
        });
      });

    new Setting(containerEl)
      .setName("Toolbar buttons")
      .setDesc("Drag rows to reorder the toolbar.");

    this.renderToolbarItems(containerEl);
  }

  private renderAddButtonSetting(containerEl: HTMLElement): void {
    const existingBuiltInCommands = new Set(
      this.plugin.settings.toolbarItems
        .filter((item) => item.type === "builtin")
        .map((item) => item.commandId),
    );
    const availableCommands = BUILTIN_COMMANDS.filter(
      (command) => !existingBuiltInCommands.has(command.id),
    );
    let selectedCommandId = availableCommands[0]?.id ?? "";

    new Setting(containerEl)
      .setName("Add button")
      .setDesc("Add another built-in action to the toolbar.")
      .addDropdown((dropdown) => {
        if (availableCommands.length === 0) {
          dropdown.addOption("", "All built-in buttons added");
          dropdown.setDisabled(true);
          return;
        }

        for (const command of availableCommands) {
          dropdown.addOption(command.id, command.name);
        }
        dropdown.setValue(selectedCommandId);
        dropdown.onChange((commandId) => {
          selectedCommandId = commandId;
        });
      })
      .addButton((button) => {
        button
          .setIcon("plus")
          .setTooltip("Add button")
          .setDisabled(availableCommands.length === 0)
          .onClick(async () => {
            if (!selectedCommandId) return;

            this.plugin.settings.toolbarItems = [
              ...this.plugin.settings.toolbarItems,
              {
                id: selectedCommandId,
                type: "builtin",
                commandId: selectedCommandId,
              },
            ];
            await this.plugin.saveSettings();
            this.plugin.refreshToolbar();
            this.update();
          });
      });
  }

  private renderToolbarItems(containerEl: HTMLElement): void {
    this.plugin.settings.toolbarItems.forEach((item, index) => {
      const setting = new Setting(containerEl)
        .setName(describeToolbarItem(item))
        .setDesc(describeToolbarItemType(item))
        .setClass("mdmenu-toolbar-setting-row");

      setting.settingEl.draggable = true;
      setting.settingEl.addEventListener("dragstart", (event) => {
        this.draggedToolbarIndex = index;
        setting.settingEl.addClass("is-dragging");
        event.dataTransfer?.setData("text/plain", String(index));
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
        }
      });
      setting.settingEl.addEventListener("dragover", (event) => {
        event.preventDefault();
        setting.settingEl.addClass("is-drag-over");
      });
      setting.settingEl.addEventListener("dragleave", () => {
        setting.settingEl.removeClass("is-drag-over");
      });
      setting.settingEl.addEventListener("drop", (event) => {
        event.preventDefault();
        setting.settingEl.removeClass("is-drag-over");

        const sourceIndex =
          this.draggedToolbarIndex ??
          Number(event.dataTransfer?.getData("text/plain"));
        this.draggedToolbarIndex = null;

        if (Number.isInteger(sourceIndex)) {
          void this.moveToolbarItem(sourceIndex, index);
        }
      });
      setting.settingEl.addEventListener("dragend", () => {
        this.draggedToolbarIndex = null;
        setting.settingEl.removeClass("is-dragging");
        setting.settingEl.removeClass("is-drag-over");
      });

      setting
        .addButton((button) => {
          button
            .setIcon("arrow-up")
            .setTooltip("Move up")
            .setDisabled(index === 0)
            .onClick(() => {
              void this.moveToolbarItem(index, index - 1);
            });
        })
        .addButton((button) => {
          button
            .setIcon("arrow-down")
            .setTooltip("Move down")
            .setDisabled(index === this.plugin.settings.toolbarItems.length - 1)
            .onClick(() => {
              void this.moveToolbarItem(index, index + 1);
            });
        })
        .addButton((button) => {
          button.setIcon("trash-2").setTooltip("Remove").onClick(async () => {
            this.plugin.settings.toolbarItems =
              this.plugin.settings.toolbarItems.filter(
                (_candidate, candidateIndex) => candidateIndex !== index,
              );
            await this.plugin.saveSettings();
            this.plugin.refreshToolbar();
            this.update();
          });
        });
    });
  }

  private async moveToolbarItem(fromIndex: number, toIndex: number): Promise<void> {
    const items = [...this.plugin.settings.toolbarItems];
    if (
      fromIndex < 0 ||
      fromIndex >= items.length ||
      toIndex < 0 ||
      toIndex >= items.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const [item] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, item);

    this.plugin.settings.toolbarItems = items;
    await this.plugin.saveSettings();
    this.plugin.refreshToolbar();
    this.update();
  }

  private nextSeparatorId(): string {
    const existingIds = new Set(
      this.plugin.settings.toolbarItems.map((item) => item.id),
    );
    let index = 1;

    while (existingIds.has(`separator-${index}`)) {
      index += 1;
    }

    return `separator-${index}`;
  }
}
