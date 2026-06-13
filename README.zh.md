# mdMenu

一个面向 Obsidian 用户的小巧类 WYSIWYG Markdown 格式层。

[English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [中文](README.zh.md) | [日本語](README.ja.md)

mdMenu 是一个 clean-room 的 Markdown 工具栏插件，灵感来自 cMenu 的产品想法。它给编辑器加上一层迷你的类 WYSIWYG 常用格式层，但你的笔记底层仍然是纯 Markdown。标题、复选框、callout、链接、高亮、代码、列表、粗体、斜体，以及一些安静的小帮手，都会留在你正在写的文字旁边。

你可以把它固定在底部，让它跟随选区，也可以拖到顺手的位置。你仍然是在写 Markdown，只是少打开几次 command palette，少记几个快捷键，并多一点直接操作格式的感觉。

> 状态：已准备好 GitHub release。Community plugin 提交正在进行中。

![mdMenu 工具栏截图](assets/readme/Screenshot%202026-06-12%20at%2015.28.52.png)

## 现在可用的功能

### Markdown 操作

内置命令包括：

- 粗体
- 斜体
- 删除线
- 下划线
- 高亮
- 清除格式
- 行内代码
- 代码块
- 引用块
- Callout
- 复选框
- 无序列表
- 有序列表
- Markdown 链接
- Wikilink
- H1-H6 标题

默认工具栏不会一次显示所有命令。它从一组适合写作的常用按钮开始，其余命令可以通过 presets 或设置页添加。

### 标题

默认工具栏把 H1、H2、H3 和 H4 显示为独立按钮。H5、H6 和分组标题菜单也仍然可用，方便你改成另一种布局。

### 工具栏位置

mdMenu 支持四种位置模式：

- `fixed`：把工具栏固定在 workspace 底部。
- `selection`：显示在选中文本附近。
- `cursor`：当浏览器提供 usable selection rectangle 时，显示在当前选区或光标附近。
- `manual`：拖动把手，把工具栏放在保存的位置。

selection、cursor 和 manual 模式都会把工具栏限制在 viewport 内，即使窗口很小也不会跑出去。

### 工具栏自定义

你可以在设置里编辑工具栏：

- 添加尚未出现在工具栏上的任意内置命令。
- 移除不用的按钮。
- 在分组之间添加视觉分隔符。
- 用 drag and drop 重新排序按钮。
- 如果 drag and drop 不方便，也可以用箭头按钮排序。
- 将工具栏恢复为默认按钮组。

分隔符是真正的工具栏项目，所以工具栏可以像分组工具一样阅读，而不是一长排图标。

### Presets

Presets 是快速起点：

- `Writer`：适合日常 Markdown 写作的完整默认集合。
- `Zettelkasten`：标题、复选框、引用、高亮、wikilinks 和 Markdown 链接。
- `Code notes`：行内代码、代码块、列表、callout 和链接。
- `Compact`：更短的工具栏，包含分组标题和紧凑视觉样式。

选择 preset 后，你仍然可以添加按钮、移除按钮、添加分隔符并重新排序。Presets 不会锁住工具栏，只是帮你省去从零搭建第一版的时间。

### 样式

- `default`：常规 Obsidian 工具栏密度。
- `compact`：更小的按钮，在笔记需要更多空间时使用。

两个样式都使用 Obsidian theme variables，所以 mdMenu 会跟随浅色和深色主题，不引入自己的颜色系统。

### 编辑细节

- 工具栏操作会把焦点返回到当前 Markdown 编辑器。
- 空的行内格式操作会把光标放在插入的标记之间。
- 如果选中文本已经被同一种行内格式包裹，再按一次会移除包裹。
- 复选框切换会保留缩进，并处理空的 checked 或 unchecked task items。
- Callout 会把当前行变成 `> [!note]`，或移除已有的 callout marker。
- 清除格式会从选区或当前行移除常见的行内包裹标记。

### 设置安全

保存的设置会在加载时被规范化。如果出现旧数据或格式错误的数据，mdMenu 会回退到默认值，而不是让工具栏失效。

### Release 支持

仓库包含本地 release build 和基于 tag 的 GitHub release workflow。Release assets 包括 `main.js`、`manifest.json` 和 `styles.css`，并带有 GitHub artifact attestations。

## 设置

设置页可以：

- 开启或关闭工具栏。
- 选择位置模式。
- 选择视觉样式。
- 重置手动工具栏位置。
- 应用 Writer、Zettelkasten、Code notes 和 Compact presets。
- 添加内置工具栏按钮。
- 添加视觉分隔符。
- 用 drag and drop 或箭头按钮重新排序。
- 移除工具栏按钮。
- 将工具栏项目重置为默认集合。

## 从 Community plugins 安装

从官方 Obsidian Community Plugins 目录安装 mdMenu：

[Obsidian Community Plugins 中的 mdMenu](https://community.obsidian.md/plugins/mdmenu)

然后在 community plugin 设置中启用 `mdMenu`。

## 使用 BRAT 安装

BRAT 可以直接从 GitHub releases 安装 mdMenu：

1. 安装 "Obsidian42 - BRAT" 插件。
2. 在 BRAT 中从 `sandsaber/mdMenu` 添加 beta plugin。
3. 在 community plugin 设置中启用 `mdMenu`。

## 从 GitHub release 安装

从最新 GitHub release 下载这些文件：

```text
main.js
manifest.json
styles.css
```

把它们放到 vault 的这里：

```text
.obsidian/plugins/mdmenu
```

然后在 community plugin 设置中启用 `mdMenu`。

## 本地构建

构建 release folder：

```bash
npm run build:dist
```

复制这个文件夹：

```text
dist/mdmenu
```

到你的 vault：

```text
.obsidian/plugins/mdmenu
```

然后在 community plugin 设置中启用 `mdMenu`。

## 开发

安装依赖：

```bash
npm install
```

运行测试：

```bash
npm run test
```

运行 lint 检查：

```bash
npm run lint
```

运行 TypeScript 检查：

```bash
npm run typecheck
```

构建 root plugin bundle：

```bash
npm run build
```

构建 release folder：

```bash
npm run build:dist
```

运行完整 pre-release check：

```bash
npm run check
```

## 隐私

mdMenu 只在 Obsidian 本地运行。它不会发送你的笔记、选区、设置或遥测数据。

## 灵感

mdMenu 受到 cMenu 的启发，cMenu 是一个较早的 Obsidian 格式工具栏插件。本项目不复制 cMenu 的源文件。

## 许可证

MIT. See [LICENSE](LICENSE).
