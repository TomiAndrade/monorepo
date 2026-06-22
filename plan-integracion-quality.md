# Plan: Integrar file-quality-report en evidence-inventory

## Contexto

Evidence-inventory escanea un directorio y devuelve un inventario (conteo por extensión, carpetas vacías, tamaños). El objetivo es que ese mismo scan también corra el análisis de calidad del file-quality-report, mostrando en la UI qué archivos son erróneos, cuáles tienen warnings, y guardando todo en un único JSON de salida.

---

## Problema técnico clave: ESM vs CJS

- `file-quality-report` usa ESM (`"type": "module"`, `export function ...`)
- `evidence-inventory/backend` usa CommonJS (`require()`)

**Solución:** dynamic `import()` desde las funciones async del backend. Node.js permite esto desde CJS sin cambiar nada de la estructura existente. Los módulos se cachean en primera llamada para no re-importar en cada scan.

---

## Archivos a modificar / crear

### 1. `backend/src/qualityAnalyzer.js` (NUEVO)

Módulo CJS que carga los módulos ESM de fqr via dynamic import y expone una función async:

```javascript
let _fqr = null;

async function _load() {
  if (_fqr) return _fqr;
  const [{ walkDirectory }, { runAllAnalyzers }, { formatReport }] = await Promise.all([
    import('../../../file-quality-report/src/walker.js'),
    import('../../../file-quality-report/src/analyzer/index.js'),
    import('../../../file-quality-report/src/reporter/formatter.js'),
  ]);
  _fqr = { walkDirectory, runAllAnalyzers, formatReport };
  return _fqr;
}

async function analyzeQuality(dirPath) {
  const { walkDirectory, runAllAnalyzers, formatReport } = await _load();
  const files = walkDirectory(dirPath);
  const results = runAllAnalyzers(files);
  return formatReport(results);
}

module.exports = { analyzeQuality };
```

Rutas de import: desde `backend/src/` sube 3 niveles para llegar a `file-quality-report/src/`.

---

### 2. `backend/src/scanner.js` (MODIFICAR)

Agregar al final de `scanDirectory()`:

```javascript
const { analyzeQuality } = require('./qualityAnalyzer');

// Al final de scanDirectory, antes del return:
const quality = await analyzeQuality(rootPath);
results.quality = quality;
```

---

### 3. `backend/src/index.js` (SIN CAMBIOS)

El endpoint `POST /api/scan` ya guarda el objeto completo en `results.json` y lo devuelve. El nuevo campo `quality` se incluye automáticamente.

---

## Estructura del JSON de salida (extendido)

```json
{
  "scannedPath": "...",
  "totalFiles": 20,
  "totalSizeBytes": 6030841,
  "emptyFolders": ["carpeta-vacia"],
  "byExtension": { ".pdf": { "count": 7, "totalSizeBytes": 6029768, "totalSizeMB": 5.75 } },
  "quality": {
    "summary": { "total": 8, "errors": 2, "warnings": 5, "infos": 1 },
    "sections": [
      {
        "title": "Errores",
        "severity": "error",
        "items": ["archivo.txt: Archivo vacío (0 bytes)", "dup.txt: Duplicado de: original.txt"]
      },
      {
        "title": "Advertencias",
        "severity": "warning",
        "items": ["video.mp4: Extensión no esperada: .mp4"]
      }
    ],
    "suggestedActions": ["Eliminar archivos vacíos...", "Revisar extensiones no esperadas..."],
    "generatedAt": "2026-06-03T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

---

## Frontend

### 4. `frontend/src/components/QualityReport.jsx` (NUEVO)

Recibe `quality` (el campo `results.quality`). Muestra:
- Barra de resumen: X errores / Y warnings / Z infos
- Sección por severidad (error → warning → info) con lista de archivos + mensaje
- Acciones sugeridas al final

Solo se renderiza si `quality` existe (retrocompatible).

### 5. `frontend/src/components/SummaryCards.jsx` (MODIFICAR)

Si `results.quality` está presente, agregar una card con el conteo de errores de calidad (o "Sin problemas de calidad" si `errors === 0`).

### 6. `frontend/src/App.jsx` (MODIFICAR)

Agregar `<QualityReport quality={results.quality} />` en el bloque condicional, después de `<FileTypeTable>`.

---

## Verificación

1. `cd backend && npm start`
2. `cd frontend && npm run dev`
3. Escanear `projects/file-quality-report/test/fixtures` (tiene archivos vacíos, duplicados, extensiones raras)
4. Verificar que `backend/outputs/results.json` incluye el campo `quality` con summary y sections
5. Verificar que la UI muestra el bloque de calidad correctamente
