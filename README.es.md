# mdMenu

Una pequeña capa de formato Markdown estilo WYSIWYG para usuarios de Obsidian.

[English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [中文](README.zh.md) | [日本語](README.ja.md)

mdMenu es un plugin clean-room con una barra de herramientas Markdown inspirada en la idea de cMenu. Añade al editor una mini capa estilo WYSIWYG para el formato común, pero mantiene tus notas como Markdown plano por debajo. Encabezados, casillas, callouts, enlaces, resaltado, código, listas, negrita, cursiva y algunas ayudas discretas quedan junto al texto que estás escribiendo.

Puedes fijarla abajo, mostrarla cerca de la selección o arrastrarla a una posición cómoda. Sigues escribiendo Markdown, solo con menos viajes a la command palette, menos atajos memorizados y un poco más de manipulación directa.

> Estado: listo para releases de GitHub. Envío al catálogo de community plugins: en progreso.

![Captura de la barra mdMenu](assets/readme/Screenshot%202026-06-12%20at%2015.28.52.png)

## Qué funciona ahora

### Acciones Markdown

El registro de comandos integrado cubre:

- Negrita
- Cursiva
- Tachado
- Subrayado
- Resaltado
- Limpiar formato
- Código en línea
- Bloque de código
- Cita
- Callout
- Casilla
- Lista con viñetas
- Lista numerada
- Enlace Markdown
- Wikilink
- Encabezados H1-H6

La barra predeterminada no muestra todos los comandos a la vez. Empieza con un conjunto útil para escribir y deja el resto disponible mediante presets o la pestaña de ajustes.

### Encabezados

La barra predeterminada muestra H1, H2, H3 y H4 como botones separados. H5, H6 y el menú agrupado de encabezados siguen disponibles si prefieres otra configuración.

### Posición de la barra

mdMenu tiene cuatro modos de posición:

- `fixed`: mantener la barra en la parte inferior del workspace.
- `selection`: mostrarla cerca del texto seleccionado.
- `cursor`: colocarla cerca de la selección actual o el cursor cuando el navegador entrega un usable selection rectangle.
- `manual`: arrastrarla por el asa y conservar la posición guardada.

Los modos selection, cursor y manual se mantienen dentro del viewport, incluso en ventanas pequeñas.

### Personalización

La barra se edita desde los ajustes:

- Añadir cualquier comando integrado que todavía no esté en la barra.
- Quitar botones que no uses.
- Añadir separadores visuales entre grupos.
- Reordenar botones con drag and drop.
- Reordenar botones con controles de flecha si drag and drop resulta incómodo.
- Restaurar la barra al conjunto predeterminado.

Los separadores son elementos reales de la barra, así que puedes hacer que se lea como grupos y no como una sola fila larga de iconos.

### Presets

Los presets son puntos de partida rápidos:

- `Writer`: el conjunto predeterminado completo para escribir Markdown.
- `Zettelkasten`: encabezados, casillas, citas, resaltado, wikilinks y enlaces Markdown.
- `Code notes`: código en línea, bloques de código, listas, callouts y enlaces.
- `Compact`: una barra más corta con encabezados agrupados y estilo compacto.

Después de elegir un preset, puedes seguir añadiendo, quitando y reordenando botones. Los presets no bloquean la barra; solo evitan construir la primera versión a mano.

### Estilos

- `default`: densidad normal de una barra de Obsidian.
- `compact`: botones más pequeños cuando la nota necesita más espacio.

Ambos estilos usan theme variables de Obsidian, así que mdMenu sigue los temas claros y oscuros sin añadir su propio sistema de color.

### Detalles de edición

- Las acciones devuelven el foco al editor Markdown activo.
- Las acciones inline vacías colocan el cursor entre los marcadores insertados.
- Si el texto seleccionado ya tiene el mismo formato inline, pulsar de nuevo quita el envoltorio.
- El cambio de casilla conserva la indentación y maneja task items vacíos marcados o sin marcar.
- Callout convierte la línea actual en `> [!note]` o elimina un marcador callout existente.
- Limpiar formato elimina envoltorios inline comunes de la selección o de la línea actual.

### Seguridad de ajustes

Los ajustes guardados se normalizan al cargar. Si aparecen datos antiguos o malformados, mdMenu vuelve a los valores predeterminados en vez de romper la barra.

### Soporte de release

El repositorio incluye una build local de release y un GitHub release workflow basado en tags. Los assets de release incluyen `main.js`, `manifest.json` y `styles.css`, con GitHub artifact attestations.

## Ajustes

La pestaña de ajustes permite:

- Activar o desactivar la barra.
- Elegir el modo de posición.
- Elegir el estilo visual.
- Restaurar la posición manual.
- Aplicar presets: Writer, Zettelkasten, Code notes y Compact.
- Añadir botones integrados.
- Añadir separadores visuales.
- Reordenar botones con drag and drop o flechas.
- Quitar botones.
- Restaurar los elementos de la barra al conjunto predeterminado.

## Instalar desde GitHub release

Descarga estos archivos del último GitHub release:

```text
main.js
manifest.json
styles.css
```

Colócalos aquí en tu vault:

```text
.obsidian/plugins/mdmenu
```

Después activa `mdMenu` desde los ajustes de community plugins.

## Build local

Construye la carpeta de release:

```bash
npm run build:dist
```

Copia esta carpeta:

```text
dist/mdmenu
```

a tu vault:

```text
.obsidian/plugins/mdmenu
```

Después activa `mdMenu` desde los ajustes de community plugins.

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Ejecutar pruebas:

```bash
npm run test
```

Ejecutar comprobaciones de lint:

```bash
npm run lint
```

Ejecutar comprobaciones de TypeScript:

```bash
npm run typecheck
```

Construir el bundle raíz del plugin:

```bash
npm run build
```

Construir la carpeta de release:

```bash
npm run build:dist
```

Ejecutar el check completo de pre-release:

```bash
npm run check
```

## Privacidad

mdMenu se ejecuta localmente dentro de Obsidian. No envía notas, selecciones, ajustes ni telemetría.

## Inspiración

mdMenu está inspirado en cMenu, un plugin anterior de barra de formato para Obsidian. Este proyecto no copia archivos fuente de cMenu.

## Licencia

MIT. See [LICENSE](LICENSE).
