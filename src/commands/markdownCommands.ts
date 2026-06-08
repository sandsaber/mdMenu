import type { Editor } from "obsidian";

export interface InlineTransformResult {
  text: string;
  cursorOffset: number;
}

export function toggleInlineWrapper(
  text: string,
  prefix: string,
  suffix = prefix,
): InlineTransformResult {
  if (text.startsWith(prefix) && text.endsWith(suffix)) {
    return {
      text: text.slice(prefix.length, text.length - suffix.length),
      cursorOffset: -prefix.length,
    };
  }

  return {
    text: `${prefix}${text}${suffix}`,
    cursorOffset: prefix.length,
  };
}

export function applyHeadingToLine(
  line: string,
  level: 1 | 2 | 3 | 4 | 5 | 6,
): string {
  const text = line.replace(/^#{1,6}\s+/, "");

  return `${"#".repeat(level)} ${text}`;
}

export function toggleCheckboxLine(line: string): string {
  const checkboxMatch = line.match(/^(\s*)-\s+\[[ xX]\](?:\s+(.*))?$/);

  if (checkboxMatch) {
    return `${checkboxMatch[1]}${checkboxMatch[2] ?? ""}`;
  }

  const indentation = line.match(/^\s*/)?.[0] ?? "";
  const text = line.slice(indentation.length);

  return `${indentation}- [ ] ${text}`;
}

export function applyInlineCommand(
  editor: Editor,
  prefix: string,
  suffix = prefix,
): void {
  const selection = editor.getSelection();
  const cursor = editor.getCursor();
  const result = toggleInlineWrapper(selection, prefix, suffix);

  editor.replaceSelection(result.text);

  if (selection.length === 0 && result.cursorOffset > 0) {
    editor.setCursor(cursor.line, cursor.ch + result.cursorOffset);
  }
}

export function applyHeadingCommand(
  editor: Editor,
  level: 1 | 2 | 3 | 4 | 5 | 6,
): void {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  editor.setLine(cursor.line, applyHeadingToLine(line, level));
}

export function applyCheckboxCommand(editor: Editor): void {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  editor.setLine(cursor.line, toggleCheckboxLine(line));
}
