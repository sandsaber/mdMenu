import type { EventRef, Workspace } from "obsidian";

export class ToolbarEvents {
  private refs: EventRef[] = [];
  private selectionHandler: (() => void) | null = null;
  private selectionDocument: Document | null = null;
  private animationFrame: number | null = null;
  private animationWindow: Window | null = null;

  constructor(
    private readonly workspace: Workspace,
    private readonly getActiveDocument: () => Document | null,
    private readonly refresh: () => void,
  ) {}

  register(): void {
    this.refs.push(
      this.workspace.on("active-leaf-change", () => this.handleContextChange()),
      this.workspace.on("layout-change", () => this.scheduleRefresh()),
      this.workspace.on("resize", () => this.scheduleRefresh()),
      this.workspace.on("editor-change", () => this.scheduleRefresh()),
      this.workspace.on("window-open", () => this.handleContextChange()),
      this.workspace.on("window-close", () => this.handleContextChange()),
    );
    this.selectionHandler = () => this.scheduleRefresh();
    this.syncSelectionDocument();
  }

  unregister(): void {
    for (const ref of this.refs) {
      this.workspace.offref(ref);
    }

    this.refs = [];
    this.cancelScheduledRefresh();

    if (this.selectionHandler && this.selectionDocument) {
      this.selectionDocument.removeEventListener(
        "selectionchange",
        this.selectionHandler,
      );
    }

    this.selectionHandler = null;
    this.selectionDocument = null;
  }

  private handleContextChange(): void {
    this.syncSelectionDocument();
    this.scheduleRefresh();
  }

  private syncSelectionDocument(): void {
    const nextDocument = this.getActiveDocument();
    if (nextDocument === this.selectionDocument) return;

    this.cancelScheduledRefresh();
    if (this.selectionHandler && this.selectionDocument) {
      this.selectionDocument.removeEventListener(
        "selectionchange",
        this.selectionHandler,
      );
    }

    this.selectionDocument = nextDocument;
    if (this.selectionHandler && this.selectionDocument) {
      this.selectionDocument.addEventListener(
        "selectionchange",
        this.selectionHandler,
      );
    }
  }

  private scheduleRefresh(): void {
    if (this.animationFrame !== null) return;

    const frameWindow = this.selectionDocument?.defaultView ?? activeWindow;
    this.animationWindow = frameWindow;
    this.animationFrame = frameWindow.requestAnimationFrame(() => {
      this.animationFrame = null;
      this.animationWindow = null;
      this.refresh();
    });
  }

  private cancelScheduledRefresh(): void {
    if (this.animationFrame !== null && this.animationWindow) {
      this.animationWindow.cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = null;
    this.animationWindow = null;
  }
}
