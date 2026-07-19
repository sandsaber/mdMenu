import type { Editor, EditorPosition } from "obsidian";

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

export function applyHeadingToText(
  text: string,
  level: 1 | 2 | 3 | 4 | 5 | 6,
): string {
  return text
    .split("\n")
    .map((line) => applyHeadingToLine(line, level))
    .join("\n");
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

export function toggleCheckboxText(text: string): string {
  return text.split("\n").map(toggleCheckboxLine).join("\n");
}

export function applyCalloutToLine(line: string): string {
  const calloutMatch = line.match(/^>\s+\[![^\]]+\](?:\s+(.*))?$/i);

  if (calloutMatch) {
    return calloutMatch[1] ?? "";
  }

  return line.length > 0 ? `> [!note] ${line}` : "> [!note]";
}

export function toggleCalloutBlock(text: string): string {
  const lines = text.split("\n");
  const calloutMatch = lines[0]?.match(/^>\s+\[![^\]]+\](?:\s+(.*))?$/i);
  const isCalloutBlock =
    Boolean(calloutMatch) &&
    lines.slice(1).every((line) => /^>(?:\s|$)/.test(line));

  if (calloutMatch && isCalloutBlock) {
    return [
      calloutMatch[1] ?? "",
      ...lines.slice(1).map((line) => line.replace(/^>\s?/, "")),
    ].join("\n");
  }

  return lines
    .map((line, index) => {
      if (index === 0) {
        return line.length > 0 ? `> [!note] ${line}` : "> [!note]";
      }

      return line.length > 0 ? `> ${line}` : ">";
    })
    .join("\n");
}

export function toggleFencedCodeBlock(text: string): string {
  const fencedBlock = text.match(/^```[^\n]*\n([\s\S]*?)\n```$/);
  if (fencedBlock) return fencedBlock[1] ?? "";

  return `\`\`\`\n${text}\n\`\`\``;
}

export function clearInlineFormatting(text: string): string {
  return text
    .replace(/\*\*([^*\n]+?)\*\*/g, "$1")
    .replace(/__([^_\n]+?)__/g, "$1")
    .replace(/~~([^~\n]+?)~~/g, "$1")
    .replace(/==([^=\n]+?)==/g, "$1")
    .replace(/`([^`\n]+?)`/g, "$1")
    .replace(/<u>([\s\S]*?)<\/u>/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1$2")
    .replace(/(^|[^_])_([^_\n]+?)_(?!_)/g, "$1$2");
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

function getSelectedLineRange(editor: Editor): {
  from: EditorPosition;
  to: EditorPosition;
} | null {
  if (editor.getSelection().length === 0) return null;

  const from = editor.getCursor("from");
  const selectionTo = editor.getCursor("to");
  const endLine =
    selectionTo.line > from.line && selectionTo.ch === 0
      ? selectionTo.line - 1
      : selectionTo.line;

  return {
    from: { line: from.line, ch: 0 },
    to: { line: endLine, ch: editor.getLine(endLine).length },
  };
}

function applyLineBlockCommand(
  editor: Editor,
  transform: (text: string) => string,
): boolean {
  const range = getSelectedLineRange(editor);
  if (!range) return false;

  const lines: string[] = [];
  for (let line = range.from.line; line <= range.to.line; line += 1) {
    lines.push(editor.getLine(line));
  }

  const transformed = transform(lines.join("\n"));
  editor.replaceRange(transformed, range.from, range.to);

  const transformedLines = transformed.split("\n");
  editor.setSelection(range.from, {
    line: range.from.line + transformedLines.length - 1,
    ch: transformedLines[transformedLines.length - 1]?.length ?? 0,
  });
  return true;
}

export function applyHeadingCommand(
  editor: Editor,
  level: 1 | 2 | 3 | 4 | 5 | 6,
): void {
  if (applyLineBlockCommand(editor, (text) => applyHeadingToText(text, level))) {
    return;
  }

  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  editor.setLine(cursor.line, applyHeadingToLine(line, level));
}

export function applyCheckboxCommand(editor: Editor): void {
  if (applyLineBlockCommand(editor, toggleCheckboxText)) return;

  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  editor.setLine(cursor.line, toggleCheckboxLine(line));
}

export function applyCalloutCommand(editor: Editor): void {
  if (applyLineBlockCommand(editor, toggleCalloutBlock)) return;

  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  editor.setLine(cursor.line, applyCalloutToLine(line));
}

export function applyCodeBlockCommand(editor: Editor): void {
  const selection = editor.getSelection();
  if (selection.length > 0) {
    editor.replaceSelection(toggleFencedCodeBlock(selection));
    return;
  }

  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);
  const isEmptyLine = currentLine.length === 0;
  editor.replaceSelection(isEmptyLine ? "```\n\n```" : "\n```\n\n```\n");
  editor.setCursor(cursor.line + (isEmptyLine ? 1 : 2), 0);
}

export function applyClearFormattingCommand(editor: Editor): void {
  const selection = editor.getSelection();

  if (selection.length > 0) {
    editor.replaceSelection(clearInlineFormatting(selection));
    return;
  }

  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);

  editor.setLine(cursor.line, clearInlineFormatting(line));
}
