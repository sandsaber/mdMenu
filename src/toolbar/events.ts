import type { EventRef, Workspace } from "obsidian";

export class ToolbarEvents {
  private refs: EventRef[] = [];
  private selectionHandler: (() => void) | null = null;
  private selectionDocument: Document | null = null;

  constructor(
    private readonly workspace: Workspace,
    private readonly refresh: () => void,
  ) {}

  register(): void {
    this.refs.push(this.workspace.on("active-leaf-change", this.refresh));
    this.refs.push(this.workspace.on("layout-change", this.refresh));
    this.selectionHandler = () => this.refresh();
    this.selectionDocument = activeDocument;
    this.selectionDocument.addEventListener("selectionchange", this.selectionHandler);
  }

  unregister(): void {
    for (const ref of this.refs) {
      this.workspace.offref(ref);
    }

    this.refs = [];

    if (this.selectionHandler && this.selectionDocument) {
      this.selectionDocument.removeEventListener(
        "selectionchange",
        this.selectionHandler,
      );
    }

    this.selectionHandler = null;
    this.selectionDocument = null;
  }
}
