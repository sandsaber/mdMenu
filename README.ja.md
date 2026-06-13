# obMenu

Obsidian ユーザーのための、小さな WYSIWYG 風 Markdown 書式レイヤーです。

[English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [中文](README.zh.md) | [日本語](README.ja.md)

obMenu は、cMenu のプロダクトアイデアに着想を得た clean-room の Markdown ツールバープラグインです。よく使う書式操作のための小さな WYSIWYG 風レイヤーをエディタに加えつつ、ノート本体は plain Markdown のまま保ちます。見出し、チェックボックス、callout、リンク、ハイライト、コード、リスト、太字、斜体などを、書いているテキストのすぐ近くに置きます。

下部に固定することも、選択範囲の近くに表示することも、使いやすい場所へドラッグして置いておくこともできます。Markdown を書く体験はそのままに、command palette を開く回数や覚えるショートカットを減らし、少しだけ直接操作に近い感覚で書式を扱えます。

> 状態：GitHub release の準備済み。Community plugin への提出は進行中です。

![obMenu ツールバーのスクリーンショット](assets/readme/Screenshot%202026-06-12%20at%2015.28.52.png)

## 現在できること

### Markdown 操作

組み込みコマンドには次が含まれます：

- 太字
- 斜体
- 取り消し線
- 下線
- ハイライト
- 書式のクリア
- インラインコード
- コードブロック
- 引用
- Callout
- チェックボックス
- 箇条書きリスト
- 番号付きリスト
- Markdown リンク
- Wikilink
- H1-H6 見出し

デフォルトのツールバーは、すべてのコマンドを一度に表示しません。書くために便利なセットから始まり、残りは presets や設定タブから追加できます。

### 見出し

デフォルトのツールバーでは、H1、H2、H3、H4 が個別のボタンとして表示されます。H5、H6、グループ化された見出しメニューも利用できるので、別の構成に変更できます。

### ツールバーの配置

obMenu には 4 つの配置モードがあります：

- `fixed`：ツールバーを workspace の下部に固定します。
- `selection`：選択したテキストの近くに表示します。
- `cursor`：ブラウザが usable selection rectangle を返す場合に、現在の選択範囲またはカーソルの近くに配置します。
- `manual`：ハンドルでドラッグし、保存された位置に置きます。

selection、cursor、manual の各モードでは、小さなウィンドウでもツールバーが viewport の内側に収まります。

### ツールバーのカスタマイズ

設定からツールバーを編集できます：

- まだツールバーにない組み込みコマンドを追加する。
- 使わないボタンを削除する。
- グループ間に視覚的な区切りを追加する。
- drag and drop でボタンを並べ替える。
- drag and drop が使いにくい場合は、矢印コントロールで並べ替える。
- ツールバーをデフォルトのセットに戻す。

区切りは実際のツールバー項目なので、長いアイコン列ではなく、グループ化された道具として読めるようにできます。

### Presets

Presets はすばやい開始点です：

- `Writer`：通常の Markdown 執筆向けの完全なデフォルトセット。
- `Zettelkasten`：見出し、チェックボックス、引用、ハイライト、wikilinks、Markdown リンク。
- `Code notes`：インラインコード、コードブロック、リスト、callout、リンク。
- `Compact`：グループ化された見出しとコンパクトな表示を持つ短めのツールバー。

Preset を選んだあとも、ボタンの追加、削除、区切りの追加、並べ替えは自由にできます。Presets はツールバーを固定するものではなく、最初の形を手で作る手間を減らすものです。

### スタイル

- `default`：通常の Obsidian ツールバー密度。
- `compact`：ノートにより多くのスペースが必要なときの小さめのボタン。

どちらのスタイルも Obsidian theme variables を使うため、obMenu は独自のカラーシステムを追加せず、ライトテーマとダークテーマに追従します。

### 編集の細部

- ツールバー操作は、アクティブな Markdown エディタへフォーカスを戻します。
- 空のインライン書式操作では、挿入されたマーカーの間にカーソルを置きます。
- 選択テキストが同じインライン書式ですでに囲まれている場合、同じ操作を押すと囲みを外します。
- チェックボックスの切り替えはインデントを保持し、空の checked / unchecked task items も扱います。
- Callout は現在行を `> [!note]` に変換するか、既存の callout marker を削除します。
- 書式のクリアは、選択範囲または現在行から一般的なインライン囲みを削除します。

### 設定の安全性

保存された設定は読み込み時に正規化されます。古いデータや不正なデータがあっても、obMenu はツールバーを壊さずデフォルトへ戻します。

### Release サポート

このリポジトリには、ローカルの release build と tag ベースの GitHub release workflow があります。Release assets には `main.js`、`manifest.json`、`styles.css` が含まれ、GitHub artifact attestations も付与されます。

## 設定

設定タブでは次のことができます：

- ツールバーのオン / オフを切り替える。
- 配置モードを選ぶ。
- 表示スタイルを選ぶ。
- 手動配置をリセットする。
- Writer、Zettelkasten、Code notes、Compact の presets を適用する。
- 組み込みツールバーボタンを追加する。
- 視覚的な区切りを追加する。
- drag and drop または矢印ボタンで並べ替える。
- ツールバーボタンを削除する。
- ツールバー項目をデフォルトセットに戻す。

## GitHub release からインストール

最新の GitHub release から次のファイルをダウンロードします：

```text
main.js
manifest.json
styles.css
```

Vault の次の場所に置きます：

```text
.obsidian/plugins/obmenu
```

その後、community plugin 設定から `obMenu` を有効にします。

## ローカルでビルド

Release folder をビルドします：

```bash
npm run build:dist
```

このフォルダをコピーします：

```text
dist/obmenu
```

Vault の次の場所へ：

```text
.obsidian/plugins/obmenu
```

その後、community plugin 設定から `obMenu` を有効にします。

## 開発

依存関係をインストール：

```bash
npm install
```

テストを実行：

```bash
npm run test
```

lint チェックを実行：

```bash
npm run lint
```

TypeScript チェックを実行：

```bash
npm run typecheck
```

Root plugin bundle をビルド：

```bash
npm run build
```

Release folder をビルド：

```bash
npm run build:dist
```

完全な pre-release check を実行：

```bash
npm run check
```

## プライバシー

obMenu は Obsidian 内でローカルに動作します。ノート、選択範囲、設定、テレメトリを送信しません。

## Inspiration

obMenu は、以前の Obsidian 書式ツールバープラグインである cMenu から着想を得ています。このプロジェクトは cMenu のソースファイルをコピーしていません。

## License

MIT License. Copyright (c) 2026 Michael Makarov.
