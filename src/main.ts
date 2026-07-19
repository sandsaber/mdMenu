import {
  MarkdownView,
  Menu,
  Plugin,
  type Command,
  type Editor,
} from "obsidian";
import {
  applyCalloutCommand,
  applyCheckboxCommand,
  applyClearFormattingCommand,
  applyCodeBlockCommand,
  applyHeadingCommand,
  applyInlineCommand,
} from "./commands/markdownCommands";
import { normalizeSettings } from "./settings";
import { MdMenuSettingTab } from "./settingsTab";
import type { MdMenuSettings, ToolbarItem } from "./types";
import { ToolbarEvents } from "./toolbar/events";
import { clampPosition, positionNearRect } from "./toolbar/positioning";
import { ToolbarController } from "./toolbar/toolbar";

interface ObsidianCommandApi {
  commands?: Record<string, Command>;
  executeCommandById(commandId: string): boolean;
  findCommand(commandId: string): Command | undefined;
  listCommands?(): Command[];
}

type AppWithCommandApi = typeof Plugin.prototype.app & {
  commands?: ObsidianCommandApi;
};

const OBSIDIAN_COMMAND_MAP: Record<string, string> = {
  blockquote: "editor:toggle-blockquote",
  "bullet-list": "editor:toggle-bullet-list",
  "numbered-list": "editor:toggle-numbered-list",
  "markdown-link": "editor:insert-link",
  wikilink: "editor:insert-wikilink",
};

export default class MdMenuPlugin extends Plugin {
  settings!: MdMenuSettings;
  private toolbar: ToolbarController | null = null;
  private events: ToolbarEvents | null = null;
  private unloaded = false;

  async onload(): Promise<void> {
    this.unloaded = false;
    this.settings = normalizeSettings(await this.loadData());
    await this.saveSettings();
    this.registerBuiltInCommands();
    this.addSettingTab(new MdMenuSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      if (this.unloaded) return;

      this.toolbar = new ToolbarController({
        app: this.app,
        settings: this.settings,
        onRunItem: (item, event) => this.runToolbarItem(item, event),
        onManualMove: (position) => {
          this.settings.manualPosition = position;
          void this.saveSettings();
        },
      });

      this.events = new ToolbarEvents(
        this.app.workspace,
        () =>
          this.app.workspace.getActiveViewOfType(MarkdownView)?.containerEl
            .doc ?? null,
        () => this.updateToolbarContext(),
      );
      this.events.register();
      this.refreshToolbar();
    });
  }

  onunload(): void {
    this.unloaded = true;
    this.events?.unregister();
    this.toolbar?.unmount();
    this.events = null;
    this.toolbar = null;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  refreshToolbar(): void {
    this.updateToolbarContext(true);
  }

  getObsidianCommands(): Command[] {
    const commandApi = this.commandApi;
    if (!commandApi) return [];

    const commands =
      commandApi.listCommands?.() ?? Object.values(commandApi.commands ?? {});

    return commands
      .filter((command) => command.id.length > 0 && command.name.length > 0)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  private updateToolbarContext(render = false): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const visible = this.settings.enabled && Boolean(view);

    if (!this.toolbar) return;

    const remounted = view
      ? this.toolbar.mount(view.containerEl.doc.body)
      : false;
    if (render || remounted) {
      this.toolbar.render();
    }
    this.toolbar.setVisible(visible);

    if (visible && view) {
      this.updateToolbarPosition(view);
    }
  }

  private get commandApi(): ObsidianCommandApi | undefined {
    return (this.app as AppWithCommandApi).commands;
  }

  private getEditor(): Editor | null {
    return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor ?? null;
  }

  private registerBuiltInCommands(): void {
    this.addCommand({
      id: "toggle-bold",
      name: "Toggle bold",
      editorCallback: (editor) => applyInlineCommand(editor, "**"),
    });
    this.addCommand({
      id: "toggle-italic",
      name: "Toggle italic",
      editorCallback: (editor) => applyInlineCommand(editor, "*"),
    });
    this.addCommand({
      id: "toggle-strikethrough",
      name: "Toggle strikethrough",
      editorCallback: (editor) => applyInlineCommand(editor, "~~"),
    });
    this.addCommand({
      id: "toggle-highlight",
      name: "Toggle highlight",
      editorCallback: (editor) => applyInlineCommand(editor, "=="),
    });
    this.addCommand({
      id: "clear-formatting",
      name: "Clear formatting",
      editorCallback: (editor) => applyClearFormattingCommand(editor),
    });
    this.addCommand({
      id: "toggle-inline-code",
      name: "Toggle inline code",
      editorCallback: (editor) => applyInlineCommand(editor, "`"),
    });
    this.addCommand({
      id: "toggle-code-block",
      name: "Toggle code block",
      editorCallback: (editor) => applyCodeBlockCommand(editor),
    });
    this.addCommand({
      id: "toggle-checkbox",
      name: "Toggle checkbox",
      editorCallback: (editor) => applyCheckboxCommand(editor),
    });
    this.addCommand({
      id: "toggle-callout",
      name: "Toggle callout",
      editorCallback: (editor) => applyCalloutCommand(editor),
    });

    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      this.addCommand({
        id: `apply-heading-${level}`,
        name: `Apply heading ${level}`,
        editorCallback: (editor) => applyHeadingCommand(editor, level),
      });
    }
  }

  private runToolbarItem(item: ToolbarItem, event: MouseEvent): void {
    const editor = this.getEditor();
    if (!editor) return;
    if (item.type === "separator" || !item.commandId) return;

    if (item.type === "obsidian") {
      this.commandApi?.executeCommandById(item.commandId);
      editor.focus();
      this.updateToolbarContext();
      return;
    }

    if (item.commandId === "heading-group") {
      this.showHeadingMenu(event, editor);
      return;
    }

    const handled = this.runBuiltInItem(item.commandId, editor);

    if (!handled) {
      const obsidianCommandId = OBSIDIAN_COMMAND_MAP[item.commandId];
      if (obsidianCommandId) {
        this.commandApi?.executeCommandById(obsidianCommandId);
      }
    }

    editor.focus();
    this.updateToolbarContext();
  }

  private runBuiltInItem(commandId: string, editor: Editor): boolean {
    const inlineCommands: Record<string, () => void> = {
      bold: () => applyInlineCommand(editor, "**"),
      italic: () => applyInlineCommand(editor, "*"),
      strikethrough: () => applyInlineCommand(editor, "~~"),
      underline: () => applyInlineCommand(editor, "<u>", "</u>"),
      "inline-code": () => applyInlineCommand(editor, "`"),
      "code-block": () => applyCodeBlockCommand(editor),
      highlight: () => applyInlineCommand(editor, "=="),
      "clear-formatting": () => applyClearFormattingCommand(editor),
      checkbox: () => applyCheckboxCommand(editor),
      callout: () => applyCalloutCommand(editor),
      "heading-1": () => applyHeadingCommand(editor, 1),
      "heading-2": () => applyHeadingCommand(editor, 2),
      "heading-3": () => applyHeadingCommand(editor, 3),
      "heading-4": () => applyHeadingCommand(editor, 4),
      "heading-5": () => applyHeadingCommand(editor, 5),
      "heading-6": () => applyHeadingCommand(editor, 6),
    };

    const run = inlineCommands[commandId];
    if (!run) return false;

    run();
    return true;
  }

  private showHeadingMenu(event: MouseEvent, editor: Editor): void {
    const menu = new Menu();

    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      menu.addItem((item) => {
        item.setTitle(`Heading ${level}`);
        item.setIcon(`heading-${level}`);
        item.onClick(() => {
          applyHeadingCommand(editor, level);
          editor.focus();
          this.updateToolbarContext();
        });
      });
    }

    menu.showAtMouseEvent(event);
  }

  private updateToolbarPosition(view: MarkdownView): void {
    if (!this.toolbar) return;

    const { editor } = view;
    const viewWindow = view.containerEl.win;
    const viewport = {
      width: viewWindow.innerWidth,
      height: viewWindow.innerHeight,
    };

    if (this.settings.positionMode === "manual") {
      const toolbarSize = this.toolbar.getSize();
      if (!toolbarSize) {
        this.toolbar.clearPosition();
        return;
      }

      const position = clampPosition(
        this.settings.manualPosition ?? {
          left: (viewport.width - toolbarSize.width) / 2,
          top: viewport.height - toolbarSize.height - 16,
        },
        toolbarSize,
        viewport,
      );

      this.toolbar.setPosition(position.left, position.top);
      return;
    }

    if (this.settings.positionMode === "fixed") {
      this.toolbar.clearPosition();
      return;
    }

    if (this.settings.positionMode === "selection" && !editor.somethingSelected()) {
      this.toolbar.setVisible(false);
      return;
    }

    const triggerRect = this.getTriggerRect(view.containerEl.doc);
    const toolbarSize = this.toolbar.getSize();

    if (!triggerRect || !toolbarSize) {
      this.toolbar.clearPosition();
      return;
    }

    const position = positionNearRect(triggerRect, toolbarSize, viewport);

    this.toolbar.setPosition(position.left, position.top);
  }

  private getTriggerRect(viewDocument: Document): DOMRect | null {
    const selection = viewDocument.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width > 0 || rect.height > 0) {
      return rect;
    }

    const rects = range.getClientRects();
    return rects.length > 0 ? rects[0] : null;
  }
}
