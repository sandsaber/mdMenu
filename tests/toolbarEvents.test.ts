import type { Workspace } from "obsidian";
import { describe, expect, it, vi } from "vitest";
import { ToolbarEvents } from "../src/toolbar/events";

function createFrameWindow() {
  let nextFrame = 1;
  const callbacks = new Map<number, () => void>();
  const requestFrame = vi.fn((callback: () => void) => {
    const frame = nextFrame;
    nextFrame += 1;
    callbacks.set(frame, callback);
    return frame;
  });

  return {
    window: {
      requestAnimationFrame: requestFrame,
      cancelAnimationFrame: vi.fn((frame: number) => {
        callbacks.delete(frame);
      }),
    } as unknown as Window,
    requestFrame,
    flush(): void {
      const pending = [...callbacks.values()];
      callbacks.clear();
      for (const callback of pending) callback();
    },
  };
}

function createSelectionDocument(defaultView: Window) {
  const listeners = new Set<() => void>();

  return {
    document: {
      defaultView,
      addEventListener: (name: string, listener: () => void) => {
        if (name === "selectionchange") listeners.add(listener);
      },
      removeEventListener: (name: string, listener: () => void) => {
        if (name === "selectionchange") listeners.delete(listener);
      },
    } as unknown as Document,
    select(): void {
      for (const listener of listeners) listener();
    },
    listenerCount(): number {
      return listeners.size;
    },
  };
}

function createWorkspace() {
  const callbacks = new Map<string, () => void>();
  const workspace = {
    on: (name: string, callback: () => void) => {
      callbacks.set(name, callback);
      return { name };
    },
    offref: vi.fn(),
  } as unknown as Workspace;

  return { workspace, callbacks };
}

describe("ToolbarEvents", () => {
  it("coalesces frequent selection changes into one animation frame", () => {
    const frames = createFrameWindow();
    const selection = createSelectionDocument(frames.window);
    const { workspace } = createWorkspace();
    const refresh = vi.fn();
    const events = new ToolbarEvents(
      workspace,
      () => selection.document,
      refresh,
    );

    events.register();
    selection.select();
    selection.select();
    selection.select();

    expect(frames.requestFrame).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();

    frames.flush();
    expect(refresh).toHaveBeenCalledTimes(1);
    events.unregister();
  });

  it("moves the selection listener to the active view document", () => {
    const frames = createFrameWindow();
    const first = createSelectionDocument(frames.window);
    const second = createSelectionDocument(frames.window);
    const { workspace, callbacks } = createWorkspace();
    let activeDocument = first.document;
    const events = new ToolbarEvents(
      workspace,
      () => activeDocument,
      vi.fn(),
    );

    events.register();
    expect(first.listenerCount()).toBe(1);

    activeDocument = second.document;
    callbacks.get("active-leaf-change")?.();

    expect(first.listenerCount()).toBe(0);
    expect(second.listenerCount()).toBe(1);
    events.unregister();
    expect(second.listenerCount()).toBe(0);
  });
});
