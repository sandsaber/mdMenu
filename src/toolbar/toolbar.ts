import { ButtonComponent, setIcon, type App, type Command } from "obsidian";
import { getBuiltInCommand } from "../commands/registry";
import type { MdMenuSettings, ToolbarItem, ToolbarPosition } from "../types";
import { clampPosition } from "./positioning";

export interface ToolbarControllerOptions {
  app: App;
  settings: MdMenuSettings;
  onRunItem: (item: ToolbarItem, event: MouseEvent) => void;
  onManualMove: (position: ToolbarPosition) => void;
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
  private dragCleanup: (() => void) | null = null;

  constructor(private readonly options: ToolbarControllerOptions) {}

  mount(parent: HTMLElement): void {
    if (this.root) return;

    this.root = createDiv({ cls: "mdmenu-toolbar" });
    parent.appendChild(this.root);
    this.render();
  }

  unmount(): void {
    this.dragCleanup?.();
    this.dragCleanup = null;
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
    this.root.toggleClass(
      "is-manual",
      this.options.settings.positionMode === "manual",
    );

    if (this.options.settings.positionMode === "manual") {
      this.renderDragHandle();
    }

    for (const item of this.options.settings.toolbarItems) {
      if (item.type === "separator") {
        this.root.createDiv({
          cls: "mdmenu-separator",
          attr: { role: "separator" },
        });
        continue;
      }

      const commandId = item.commandId;
      if (!commandId) continue;

      const definition =
        item.type === "builtin" ? getBuiltInCommand(commandId) : undefined;
      const command =
        item.type === "obsidian"
          ? findObsidianCommand(this.options.app, commandId)
          : undefined;
      const label = definition?.name ?? command?.name ?? commandId;
      const icon = definition?.icon ?? command?.icon ?? "circle-help";
      const disabled = item.type === "obsidian" && !command;
      const tooltip = disabled ? `Missing command: ${commandId}` : label;

      const button = new ButtonComponent(this.root);
      button.setClass("mdmenu-button");
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

  private renderDragHandle(): void {
    if (!this.root) return;

    const handle = this.root.createEl("button", {
      cls: "mdmenu-drag-handle",
      attr: {
        "aria-label": "Drag toolbar",
        type: "button",
      },
    });
    setIcon(handle, "grip-vertical");
    handle.addEventListener("pointerdown", (event) =>
      this.startManualDrag(event),
    );
  }

  setVisible(visible: boolean): void {
    this.root?.toggleClass("is-hidden", !visible);
  }

  setPosition(left: number, top: number): void {
    if (!this.root) return;

    this.root.addClass("is-positioned");
    this.root.setCssProps({
      "--mdmenu-left": `${left}px`,
      "--mdmenu-top": `${top}px`,
    });
  }

  clearPosition(): void {
    if (!this.root) return;

    this.root.removeClass("is-positioned");
  }

  getSize(): { width: number; height: number } | null {
    if (!this.root) return null;

    const rect = this.root.getBoundingClientRect();

    return {
      width: rect.width,
      height: rect.height,
    };
  }

  private startManualDrag(event: PointerEvent): void {
    if (!this.root || event.button !== 0) return;

    event.preventDefault();
    this.dragCleanup?.();

    const root = this.root;
    const startRect = root.getBoundingClientRect();
    const startPointer = { left: event.clientX, top: event.clientY };
    let latestPosition: ToolbarPosition = {
      left: startRect.left,
      top: startRect.top,
    };

    root.addClass("is-dragging");

    const onPointerMove = (moveEvent: PointerEvent) => {
      const toolbarSize = this.getSize();
      if (!toolbarSize) return;

      latestPosition = clampPosition(
        {
          left: startRect.left + moveEvent.clientX - startPointer.left,
          top: startRect.top + moveEvent.clientY - startPointer.top,
        },
        toolbarSize,
        { width: activeWindow.innerWidth, height: activeWindow.innerHeight },
      );

      this.setPosition(latestPosition.left, latestPosition.top);
    };

    const stopDrag = () => {
      this.dragCleanup?.();
      this.dragCleanup = null;
      root.removeClass("is-dragging");
      this.options.onManualMove(latestPosition);
    };

    activeDocument.addEventListener("pointermove", onPointerMove);
    activeDocument.addEventListener("pointerup", stopDrag, { once: true });
    activeDocument.addEventListener("pointercancel", stopDrag, { once: true });

    this.dragCleanup = () => {
      activeDocument.removeEventListener("pointermove", onPointerMove);
      activeDocument.removeEventListener("pointerup", stopDrag);
      activeDocument.removeEventListener("pointercancel", stopDrag);
    };
  }
}
