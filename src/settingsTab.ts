import {
  FuzzySuggestModal,
  PluginSettingTab,
  Setting,
  type App,
  type Command,
  type SettingDefinitionItem,
} from "obsidian";
import { BUILTIN_COMMANDS, getBuiltInCommand } from "./commands/registry";
import { DEFAULT_TOOLBAR_ITEMS, TOOLBAR_PRESETS } from "./settings";
import type MdMenuPlugin from "./main";
import type {
  MdMenuSettings,
  ToolbarItem,
  ToolbarPositionMode,
  ToolbarPresetId,
  ToolbarVisualStyle,
} from "./types";

const SETTING_COPY = {
  enabled: {
    name: "Enable mdMenu",
    desc: "Show the Markdown formatting toolbar while editing.",
  },
  positionMode: {
    name: "Position mode",
    desc: "Choose where the toolbar appears.",
  },
  resetManualPosition: {
    name: "Reset manual position",
    desc: "Move the draggable toolbar back to its default position.",
  },
  visualStyle: {
    name: "Visual style",
    desc: "Choose the toolbar density.",
  },
  toolbarPreset: {
    name: "Toolbar preset",
    desc: "Replace the current toolbar with a focused button set.",
  },
  addButton: {
    name: "Add button",
    desc: "Add another built-in action to the toolbar.",
  },
  addObsidianCommand: {
    name: "Add Obsidian command",
    desc: "Choose any available command from the command palette.",
  },
  addSeparator: {
    name: "Add separator",
    desc: "Insert a visual divider at the end of the toolbar.",
  },
  resetToolbar: {
    name: "Reset toolbar",
    desc: "Restore the default mdMenu toolbar items.",
  },
  toolbarButtons: {
    name: "Toolbar buttons",
    desc: "Drag rows to reorder the toolbar.",
  },
} as const;

type MdMenuSettingKey = keyof MdMenuSettings;
type SettingCopyKey = keyof typeof SETTING_COPY;

interface DeclarativeSettingTab {
  update(): void;
}

interface LegacySettingTab {
  display(): void;
}

class ObsidianCommandPicker extends FuzzySuggestModal<Command> {
  constructor(
    app: App,
    private readonly commands: Command[],
    private readonly chooseCommand: (command: Command) => void | Promise<void>,
  ) {
    super(app);
    this.setPlaceholder("Choose an Obsidian command");
  }

  getItems(): Command[] {
    return this.commands;
  }

  getItemText(command: Command): string {
    return `${command.name} (${command.id})`;
  }

  onChooseItem(command: Command): void {
    void this.chooseCommand(command);
  }
}

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

  getSettingDefinitions(): SettingDefinitionItem<MdMenuSettingKey>[] {
    return [
      {
        ...SETTING_COPY.enabled,
        render: (setting) => this.addEnabledControl(setting),
      },
      {
        ...SETTING_COPY.positionMode,
        render: (setting) => this.addPositionModeControl(setting),
      },
      {
        ...SETTING_COPY.resetManualPosition,
        render: (setting) => this.addResetManualPositionControl(setting),
      },
      {
        ...SETTING_COPY.visualStyle,
        render: (setting) => this.addVisualStyleControl(setting),
      },
      {
        ...SETTING_COPY.toolbarPreset,
        render: (setting) => this.addToolbarPresetControl(setting),
      },
      {
        ...SETTING_COPY.addButton,
        render: (setting) => this.addButtonControl(setting),
      },
      {
        ...SETTING_COPY.addObsidianCommand,
        render: (setting) => this.addObsidianCommandControl(setting),
      },
      {
        ...SETTING_COPY.addSeparator,
        render: (setting) => this.addSeparatorControl(setting),
      },
      {
        ...SETTING_COPY.resetToolbar,
        render: (setting) => this.addResetToolbarControl(setting),
      },
      SETTING_COPY.toolbarButtons,
      {
        type: "list",
        emptyState: "No toolbar buttons configured.",
        items: this.plugin.settings.toolbarItems.map((item) => ({
          name: describeToolbarItem(item),
          desc: describeToolbarItemType(item),
          render: (setting) => this.addToolbarItemControls(setting, item),
        })),
        onReorder: (oldIndex, newIndex) => {
          void this.moveToolbarItem(oldIndex, newIndex);
        },
        onDelete: (index) => {
          void this.removeToolbarItem(index);
        },
      },
    ];
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    this.addEnabledControl(this.createSetting(containerEl, "enabled"));
    this.addPositionModeControl(
      this.createSetting(containerEl, "positionMode"),
    );
    this.addResetManualPositionControl(
      this.createSetting(containerEl, "resetManualPosition"),
    );
    this.addVisualStyleControl(this.createSetting(containerEl, "visualStyle"));
    this.addToolbarPresetControl(
      this.createSetting(containerEl, "toolbarPreset"),
    );

    this.renderAddButtonSetting(containerEl);
    this.addObsidianCommandControl(
      this.createSetting(containerEl, "addObsidianCommand"),
    );

    this.addSeparatorControl(this.createSetting(containerEl, "addSeparator"));
    this.addResetToolbarControl(
      this.createSetting(containerEl, "resetToolbar"),
    );

    this.createSetting(containerEl, "toolbarButtons");

    this.renderToolbarItems(containerEl);
  }

  private createSetting(
    containerEl: HTMLElement,
    copyKey: SettingCopyKey,
  ): Setting {
    const copy = SETTING_COPY[copyKey];
    return new Setting(containerEl).setName(copy.name).setDesc(copy.desc);
  }

  private addEnabledControl(setting: Setting): void {
    setting.addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.enabled);
      toggle.onChange(async (enabled) => {
        this.plugin.settings.enabled = enabled;
        await this.plugin.saveSettings();
        this.plugin.refreshToolbar();
      });
    });
  }

  private addPositionModeControl(setting: Setting): void {
    setting.addDropdown((dropdown) => {
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
  }

  private addResetManualPositionControl(setting: Setting): void {
    setting.addButton((button) => {
      button.setIcon("rotate-ccw").setTooltip("Reset position");
      button.onClick(async () => {
        this.plugin.settings.manualPosition = null;
        await this.plugin.saveSettings();
        this.plugin.refreshToolbar();
      });
    });
  }

  private addVisualStyleControl(setting: Setting): void {
    setting.addDropdown((dropdown) => {
      dropdown
        .addOptions({ default: "Default", compact: "Compact" })
        .setValue(this.plugin.settings.visualStyle)
        .onChange(async (visualStyle) => {
          this.plugin.settings.visualStyle = visualStyle as ToolbarVisualStyle;
          await this.plugin.saveSettings();
          this.plugin.refreshToolbar();
        });
    });
  }

  private addToolbarPresetControl(setting: Setting): void {
    setting.addDropdown((dropdown) => {
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
        this.rerender();
      });
    });
  }

  private addButtonControl(setting: Setting): void {
    const existingBuiltInCommands = new Set(
      this.plugin.settings.toolbarItems
        .filter((item) => item.type === "builtin")
        .map((item) => item.commandId),
    );
    const availableCommands = BUILTIN_COMMANDS.filter(
      (command) => !existingBuiltInCommands.has(command.id),
    );
    let selectedCommandId = availableCommands[0]?.id ?? "";

    setting
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
            this.rerender();
          });
      });
  }

  private addSeparatorControl(setting: Setting): void {
    setting.addButton((button) => {
      button.setIcon("separator-horizontal").setTooltip("Add separator");
      button.onClick(async () => {
        this.plugin.settings.toolbarItems = [
          ...this.plugin.settings.toolbarItems,
          { id: this.nextSeparatorId(), type: "separator" },
        ];
        await this.plugin.saveSettings();
        this.plugin.refreshToolbar();
        this.rerender();
      });
    });
  }

  private addObsidianCommandControl(setting: Setting): void {
    const existingCommandIds = new Set(
      this.plugin.settings.toolbarItems
        .filter((item) => item.type === "obsidian")
        .map((item) => item.commandId),
    );
    const availableCommands = this.plugin
      .getObsidianCommands()
      .filter((command) => !existingCommandIds.has(command.id));

    setting.addButton((button) => {
      button
        .setButtonText(
          availableCommands.length > 0 ? "Choose command" : "No commands available",
        )
        .setIcon("search")
        .setDisabled(availableCommands.length === 0)
        .onClick(() => {
          new ObsidianCommandPicker(
            this.app,
            availableCommands,
            async (command) => {
              this.plugin.settings.toolbarItems = [
                ...this.plugin.settings.toolbarItems,
                {
                  id: `obsidian:${command.id}`,
                  type: "obsidian",
                  commandId: command.id,
                },
              ];
              await this.plugin.saveSettings();
              this.plugin.refreshToolbar();
              this.rerender();
            },
          ).open();
        });
    });
  }

  private addResetToolbarControl(setting: Setting): void {
    setting.addButton((button) => {
      button.setIcon("undo-2").setTooltip("Reset toolbar").onClick(async () => {
        this.plugin.settings.toolbarItems = structuredClone(
          DEFAULT_TOOLBAR_ITEMS,
        );
        await this.plugin.saveSettings();
        this.plugin.refreshToolbar();
        this.rerender();
      });
    });
  }

  private addToolbarItemControls(setting: Setting, item: ToolbarItem): void {
    const index = this.plugin.settings.toolbarItems.indexOf(item);
    setting.setClass("mdmenu-toolbar-setting-row");
    setting
      .addButton((button) => {
        button
          .setIcon("arrow-up")
          .setTooltip("Move up")
          .setDisabled(index <= 0)
          .onClick(() => {
            const currentIndex = this.plugin.settings.toolbarItems.indexOf(item);
            void this.moveToolbarItem(currentIndex, currentIndex - 1);
          });
      })
      .addButton((button) => {
        button
          .setIcon("arrow-down")
          .setTooltip("Move down")
          .setDisabled(
            index === this.plugin.settings.toolbarItems.length - 1,
          )
          .onClick(() => {
            const currentIndex = this.plugin.settings.toolbarItems.indexOf(item);
            void this.moveToolbarItem(currentIndex, currentIndex + 1);
          });
      });
  }

  private renderAddButtonSetting(containerEl: HTMLElement): void {
    this.addButtonControl(this.createSetting(containerEl, "addButton"));
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
          button.setIcon("trash-2").setTooltip("Remove").onClick(() => {
            void this.removeToolbarItem(index);
          });
        });
    });
  }

  private async removeToolbarItem(index: number): Promise<void> {
    if (index < 0 || index >= this.plugin.settings.toolbarItems.length) return;

    this.plugin.settings.toolbarItems =
      this.plugin.settings.toolbarItems.filter(
        (_candidate, candidateIndex) => candidateIndex !== index,
      );
    await this.plugin.saveSettings();
    this.plugin.refreshToolbar();
    this.rerender();
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
    this.rerender();
  }

  private rerender(): void {
    const declarativeTab = this as Partial<DeclarativeSettingTab>;
    if (typeof declarativeTab.update === "function") {
      declarativeTab.update();
      return;
    }

    const legacyTab = this as LegacySettingTab;
    legacyTab.display();
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
