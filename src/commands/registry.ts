import type { BuiltInCommandDefinition } from "../types";

export const BUILTIN_COMMANDS: BuiltInCommandDefinition[] = [
  {
    id: "bold",
    name: "Bold",
    icon: "bold",
    group: "formatting",
  },
  {
    id: "italic",
    name: "Italic",
    icon: "italic",
    group: "formatting",
  },
  {
    id: "strikethrough",
    name: "Strikethrough",
    icon: "strikethrough",
    group: "formatting",
  },
  {
    id: "underline",
    name: "Underline",
    icon: "underline",
    group: "formatting",
  },
  {
    id: "inline-code",
    name: "Inline Code",
    icon: "code",
    group: "formatting",
  },
  {
    id: "code-block",
    name: "Code Block",
    icon: "file-code",
    group: "blocks",
  },
  {
    id: "blockquote",
    name: "Blockquote",
    icon: "quote",
    group: "blocks",
  },
  {
    id: "highlight",
    name: "Highlight",
    icon: "highlighter",
    group: "formatting",
  },
  {
    id: "checkbox",
    name: "Checkbox",
    icon: "square-check",
    group: "blocks",
  },
  {
    id: "bullet-list",
    name: "Bullet List",
    icon: "list",
    group: "blocks",
  },
  {
    id: "numbered-list",
    name: "Numbered List",
    icon: "list-ordered",
    group: "blocks",
  },
  {
    id: "markdown-link",
    name: "Markdown Link",
    icon: "link",
    group: "links",
  },
  {
    id: "wikilink",
    name: "Wikilink",
    icon: "brackets",
    group: "links",
  },
  {
    id: "heading-group",
    name: "Headings",
    icon: "heading",
    group: "headings",
  },
  {
    id: "heading-1",
    name: "Heading 1",
    icon: "heading-1",
    group: "headings",
  },
  {
    id: "heading-2",
    name: "Heading 2",
    icon: "heading-2",
    group: "headings",
  },
  {
    id: "heading-3",
    name: "Heading 3",
    icon: "heading-3",
    group: "headings",
  },
  {
    id: "heading-4",
    name: "Heading 4",
    icon: "heading-4",
    group: "headings",
  },
  {
    id: "heading-5",
    name: "Heading 5",
    icon: "heading-5",
    group: "headings",
  },
  {
    id: "heading-6",
    name: "Heading 6",
    icon: "heading-6",
    group: "headings",
  },
];

export function getBuiltInCommand(
  id: string,
): BuiltInCommandDefinition | undefined {
  return BUILTIN_COMMANDS.find((command) => command.id === id);
}
