import { ButtonComponent, setIcon, type App, type Command } from "obsidian";
import { getBuiltInCommand } from "../commands/registry";
import type { ObMenuSettings, ToolbarItem } from "../types";

export interface ToolbarControllerOptions {
  app: App;
  settings: ObMenuSettings;
  onRunItem: (item: ToolbarItem, event: MouseEvent) => void;
}

interface CommandLookup {
  findCommand(commandId: string): Command | undefined;
}

type AppWithCommands = App & {
  commands?: CommandLookup;
};

function findObsidianCommand(app: App, commandId: string): Command | undefined {
  return (app as AppWithCommands).commands?.findCommand(commandId);
}

export class ToolbarController {
  private root: HTMLDivElement | null = null;

  constructor(private readonly options: ToolbarControllerOptions) {}

  mount(parent: HTMLElement): void {
    if (this.root) return;

    this.root = createDiv({ cls: "obmenu-toolbar" });
    parent.appendChild(this.root);
    this.render();
  }

  unmount(): void {
    this.root?.remove();
    this.root = null;
  }

  render(): void {
    if (!this.root) return;

    this.root.empty();
    this.root.toggleClass(
      "is-compact",
      this.options.settings.visualStyle === "compact",
    );

    for (const item of this.options.settings.toolbarItems) {
      const definition =
        item.type === "builtin" ? getBuiltInCommand(item.commandId) : undefined;
      const command =
        item.type === "obsidian"
          ? findObsidianCommand(this.options.app, item.commandId)
          : undefined;
      const label = definition?.name ?? command?.name ?? item.commandId;
      const icon = definition?.icon ?? command?.icon ?? "circle-help";
      const disabled = item.type === "obsidian" && !command;
      const tooltip = disabled ? `Missing command: ${item.commandId}` : label;

      const button = new ButtonComponent(this.root);
      button.setClass("obmenu-button");
      button.setTooltip(tooltip);
      button.setDisabled(disabled);
      button.buttonEl.setAttribute("aria-label", tooltip);
      setIcon(button.buttonEl, icon);
      button.onClick((event) => {
        if (!disabled) {
          this.options.onRunItem(item, event);
        }
      });
    }
  }

  setVisible(visible: boolean): void {
    this.root?.toggleClass("is-hidden", !visible);
  }

  setPosition(left: number, top: number): void {
    if (!this.root) return;

    this.root.addClass("is-positioned");
    this.root.style.bottom = "auto";
    this.root.style.left = `${left}px`;
    this.root.style.top = `${top}px`;
  }

  clearPosition(): void {
    if (!this.root) return;

    this.root.removeClass("is-positioned");
    this.root.style.left = "";
    this.root.style.top = "";
    this.root.style.bottom = "";
  }

  getSize(): { width: number; height: number } | null {
    if (!this.root) return null;

    const rect = this.root.getBoundingClientRect();

    return {
      width: rect.width,
      height: rect.height,
    };
  }
}
