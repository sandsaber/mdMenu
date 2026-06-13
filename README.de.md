# mdMenu

Eine kleine WYSIWYG-aehnliche Markdown-Formatierungsebene fuer Obsidian-Nutzer.

[English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [中文](README.zh.md) | [日本語](README.ja.md)

mdMenu ist ein Clean-Room-Plugin mit einer Markdown-Werkzeugleiste, inspiriert von der Produktidee hinter cMenu. Es gibt dem Editor eine kleine WYSIWYG-aehnliche Ebene fuer haeufige Formatierungen, waehrend deine Notizen darunter reines Markdown bleiben. Ueberschriften, Checkboxen, Callouts, Links, Hervorhebungen, Code, Listen, Fett, Kursiv und ein paar leise Helfer bleiben direkt neben dem Text, den du schreibst.

Du kannst die Leiste unten anheften, neben der Auswahl anzeigen oder an eine bequeme Stelle ziehen. Du schreibst weiterhin Markdown, nur mit weniger Wegen zur command palette, weniger gemerkten Tastenkombinationen und etwas direkterer Formatierung.

> Status: bereit fuer GitHub-Releases. Einreichung fuer community plugins: in Arbeit.

![Screenshot der mdMenu-Leiste](assets/readme/Screenshot%202026-06-12%20at%2015.28.52.png)

## Was jetzt funktioniert

### Markdown-Aktionen

Die eingebaute Befehlsliste enthaelt:

- Fett
- Kursiv
- Durchgestrichen
- Unterstrichen
- Hervorheben
- Formatierung entfernen
- Inline-Code
- Codeblock
- Zitat
- Callout
- Checkbox
- Aufzaehlung
- Nummerierte Liste
- Markdown-Link
- Wikilink
- Ueberschriften H1-H6

Die Standardleiste zeigt nicht alle Befehle gleichzeitig. Sie startet mit einem nuetzlichen Schreibset; der Rest bleibt ueber Presets oder die Einstellungsseite verfuegbar.

### Ueberschriften

Die Standardleiste zeigt H1, H2, H3 und H4 als einzelne Buttons. H5, H6 und das gruppierte Ueberschriftenmenue sind weiterhin verfuegbar, wenn du eine andere Einrichtung bevorzugst.

### Position der Leiste

mdMenu hat vier Positionsmodi:

- `fixed`: die Leiste unten im Workspace halten.
- `selection`: die Leiste nahe am markierten Text anzeigen.
- `cursor`: die Leiste nahe an aktueller Auswahl oder Cursor platzieren, wenn der Browser ein usable selection rectangle liefert.
- `manual`: die Leiste am Griff ziehen und die gespeicherte Position behalten.

Selection, cursor und manual bleiben innerhalb des Viewports, auch in kleinen Fenstern.

### Anpassung

Die Leiste kann in den Einstellungen bearbeitet werden:

- Eingebaute Befehle hinzufuegen, die noch nicht in der Leiste sind.
- Nicht benoetigte Buttons entfernen.
- Visuelle Trenner zwischen Gruppen einfuegen.
- Buttons per drag and drop neu sortieren.
- Buttons mit Pfeilsteuerung neu sortieren, wenn drag and drop unpraktisch ist.
- Die Leiste auf das Standardset zuruecksetzen.

Trenner sind echte Elemente der Leiste. So wirkt die Leiste wie gruppierte Werkzeuge statt wie eine lange Symbolreihe.

### Presets

Presets sind schnelle Startpunkte:

- `Writer`: das vollstaendige Standardset fuer normales Markdown-Schreiben.
- `Zettelkasten`: Ueberschriften, Checkboxen, Zitate, Hervorhebungen, Wikilinks und Markdown-Links.
- `Code notes`: Inline-Code, Codeblocks, Listen, Callouts und Links.
- `Compact`: eine kuerzere Leiste mit gruppierten Ueberschriften und kompaktem Stil.

Nach der Wahl eines Presets kannst du weiterhin Buttons hinzufuegen, entfernen und sortieren. Presets sperren die Leiste nicht; sie sparen nur den ersten manuellen Aufbau.

### Stile

- `default`: normale Obsidian-Werkzeugleisten-Dichte.
- `compact`: kleinere Buttons, wenn die Notiz mehr Platz braucht.

Beide Stile verwenden Obsidian theme variables. Dadurch folgt mdMenu hellen und dunklen Themes ohne eigenes Farbsystem.

### Bearbeitungsdetails

- Aktionen setzen den Fokus zurueck in den aktiven Markdown-Editor.
- Leere Inline-Aktionen setzen den Cursor zwischen die eingefuegten Marker.
- Wenn markierter Text bereits mit derselben Inline-Formatierung umschlossen ist, entfernt ein erneuter Klick die Umfassung.
- Checkbox-Umschaltung behaelt Einrueckung bei und behandelt leere aktivierte oder deaktivierte task items.
- Callout wandelt die aktuelle Zeile in `> [!note]` um oder entfernt einen vorhandenen callout marker.
- Formatierung entfernen loescht haeufige Inline-Umfassungen aus Auswahl oder aktueller Zeile.

### Sichere Einstellungen

Gespeicherte Einstellungen werden beim Laden normalisiert. Wenn alte oder fehlerhafte Daten auftauchen, faellt mdMenu auf Standardwerte zurueck, statt die Leiste zu brechen.

### Release-Unterstuetzung

Das Repository enthaelt einen lokalen Release-Build und einen tag-basierten GitHub release workflow. Release-Assets sind `main.js`, `manifest.json` und `styles.css`, mit GitHub artifact attestations.

## Einstellungen

Die Einstellungsseite erlaubt:

- Die Leiste ein- oder ausschalten.
- Den Positionsmodus waehlen.
- Den visuellen Stil waehlen.
- Die manuelle Position zuruecksetzen.
- Presets anwenden: Writer, Zettelkasten, Code notes und Compact.
- Eingebaute Buttons hinzufuegen.
- Visuelle Trenner hinzufuegen.
- Buttons per drag and drop oder Pfeiltasten sortieren.
- Buttons entfernen.
- Elemente der Leiste auf das Standardset zuruecksetzen.

## Installation aus GitHub release

Lade diese Dateien aus dem neuesten GitHub release herunter:

```text
main.js
manifest.json
styles.css
```

Lege sie in deinem Vault hier ab:

```text
.obsidian/plugins/mdmenu
```

Aktiviere danach `mdMenu` in den Einstellungen fuer community plugins.

## Lokal bauen

Baue den Release-Ordner:

```bash
npm run build:dist
```

Kopiere diesen Ordner:

```text
dist/mdmenu
```

in deinen Vault:

```text
.obsidian/plugins/mdmenu
```

Aktiviere danach `mdMenu` in den Einstellungen fuer community plugins.

## Entwicklung

Abhaengigkeiten installieren:

```bash
npm install
```

Tests ausfuehren:

```bash
npm run test
```

Lint-Pruefungen ausfuehren:

```bash
npm run lint
```

TypeScript pruefen:

```bash
npm run typecheck
```

Root-Plugin-Bundle bauen:

```bash
npm run build
```

Release-Ordner bauen:

```bash
npm run build:dist
```

Vollstaendigen pre-release check ausfuehren:

```bash
npm run check
```

## Datenschutz

mdMenu laeuft lokal in Obsidian. Es sendet keine Notizen, Auswahlen, Einstellungen oder Telemetrie.

## Inspiration

mdMenu ist von cMenu inspiriert, einem frueheren Formatierungsleisten-Plugin fuer Obsidian. Dieses Projekt kopiert keine cMenu-Quelldateien.

## Lizenz

MIT. See [LICENSE](LICENSE).
