# File Quality Report

Herramienta CLI para analizar la calidad de archivos dentro de un directorio.

El objetivo es detectar problemas comunes que afectan la organización, mantenimiento y limpieza de repositorios o conjuntos de evidencia digital.

## Características

Actualmente el analizador puede detectar:

- Archivos vacíos
- Extensiones no esperadas
- Duplicados probables
- Archivos muy grandes
- Archivos muy pequeños
- Archivos sin metadata mínima

Además:

- Genera reportes legibles en consola
- Permite exportar resultados en formato JSON
- Ignora archivos técnicos del repositorio (`.gitkeep`, `desktop.ini`, `Thumbs.db`)

---

## Estructura del proyecto

```text
file-quality-report/
├── src/
│   ├── analyzer/
│   │   ├── duplicates.js
│   │   ├── emptyFiles.js
│   │   ├── missingMetadata.js
│   │   ├── sizeOutliers.js
│   │   ├── unexpectedExtensions.js
│   │   └── index.js
│   │
│   ├── reporter/
│   │   ├── formatter.js
│   │   ├── consoleReporter.js
│   │   ├── jsonReporter.js
│   │   └── index.js
│   │
│   ├── walker.js
│   └── index.js
│
├── outputs/
├── docs/
├── test/
└── README.md
```

---

## Requisitos

- Node.js 18 o superior
- Sistema operativo compatible con Node.js

---

## Uso

### Analizar el directorio actual

```bash
node src/index.js
```

### Analizar un directorio específico

```bash
node src/index.js ./ruta/al/directorio
```

Ejemplo:

```bash
node src/index.js ../evidence-inventory
```

---

## Exportar reporte JSON

```bash
node src/index.js . --json
```

El reporte se guarda automáticamente en:

```text
outputs/report-{timestamp}.json
```

Ejemplo:

```text
outputs/report-2026-06-01T18-45-10-000Z.json
```

---

## Ejemplo de salida

```text
═══════════════════════════════════════
   FILE QUALITY REPORT
═══════════════════════════════════════

✖ Errores
---------
  archivo-vacio.txt: Archivo vacío (0 bytes)

⚠ Advertencias
--------------
  video.mp4: Extensión no esperada: .mp4

Acciones sugeridas:
  • Eliminar archivos vacíos o agregarles contenido relevante
  • Revisar archivos con extensiones no esperadas

═══════════════════════════════════════
Resumen:
  Errores: 1
  Advertencias: 1
  Informativos: 0
  Total: 2
═══════════════════════════════════════
```

---

## Reglas de validación

| Regla | Severidad |
|---------|---------|
| Archivo vacío | Error |
| Duplicado probable | Error |
| Extensión inesperada | Warning |
| Archivo muy grande | Warning |
| Metadata faltante | Warning |
| Archivo muy pequeño | Info |

---

## Archivos ignorados

El analizador excluye automáticamente:

```text
.gitkeep
desktop.ini
Thumbs.db
```

También ignora directorios comunes de build y dependencias:

```text
node_modules/
dist/
dist-electron/
release/
.git/
```

---

## Futuras mejoras

- Configuración mediante archivo JSON
- Reglas personalizables
- Reportes HTML
- Integración con Evidence Inventory
- Métricas históricas de calidad
- Modo CI/CD

---

## Estado

Proyecto en desarrollo.

Versión actual: **0.1.0**