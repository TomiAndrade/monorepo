# file-quality-report — Claude Context

CLI Node.js (ESM) que analiza la calidad de los archivos en un directorio y reporta problemas.

## Uso

```bash
node src/index.js [directorio] [--json]
# Si no se pasa directorio, usa cwd.
# --json guarda el reporte en outputs/report-<timestamp>.json
```

## Pipeline

```
walkDirectory(dir)
  → runAllAnalyzers(files, options)
    → formatReport(results)
      → printReport(report)
```

## Módulos clave

| Archivo | Qué hace |
|---|---|
| `src/index.js` | Entry point. Parsea args, carga config, ejecuta el pipeline. |
| `src/walker.js` | Recorre el directorio recursivamente, devuelve lista de archivos con metadata. |
| `src/config.js` | Carga `fqr.config.json` desde el directorio objetivo o cwd. Silencioso si no existe. |
| `src/analyzer/index.js` | Orquesta los 5 detectores y devuelve todos los resultados. |
| `src/reporter/formatter.js` | Agrupa resultados por severidad y calcula totales. |
| `src/reporter/index.js` | Exporta `formatReport`, `printReport`, `saveJsonReport`. |

## Los 5 detectores (`src/analyzer/`)

| Detector | Severidad por defecto |
|---|---|
| `emptyFiles.js` | `error` |
| `duplicates.js` | `error` |
| `unexpectedExtensions.js` | `warning` (escalable a `error` via `errorExtensions` en config) |
| `sizeOutliers.js` | `warning` (too_large) / `info` (too_small) |
| `missingMetadata.js` | `warning` |

## Configuración (`fqr.config.json`)

Se puede poner en el directorio a escanear o en cwd. Ver `fqr.config.example.json`.

```json
{
  "allowedExtensions": [".js", ".ts", ...],
  "errorExtensions": [".exe", ".bat", ...]
}
```

- `allowedExtensions`: extensiones que NO se reportan como inesperadas.
- `errorExtensions`: extensiones que se reportan como `error` en vez de `warning`.

## Tests

```bash
npm test
# Jest con --experimental-vm-modules (ESM)
```
