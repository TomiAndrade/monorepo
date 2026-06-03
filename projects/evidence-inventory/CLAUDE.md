# evidence-inventory — Claude Context

App de escritorio (Electron) para inventariar carpetas de evidencia industrial. Escanea directorios recursivamente, genera reportes por tipo de archivo y analiza la calidad de los archivos usando `file-quality-report`.

## Arquitectura

```
electron/main.js          ← shell Electron
  spawns → backend/       ← Express API en puerto 3001
  loads  → frontend/dist/ ← React (Vite) en puerto 5173 (dev) o dist/ (prod)
```

Electron inicia el backend como proceso hijo, espera a que el puerto 3001 esté disponible, y luego carga la UI (Vite en dev, build estático en producción).

## Estructura

```
backend/
  src/index.js          ← Express server (puerto 3001), CORS acepta cualquier localhost
  src/scanner.js        ← escaneo de directorio + llama a qualityAnalyzer al final
  src/qualityAnalyzer.js← carga módulos ESM de file-quality-report via dynamic import
  outputs/              ← results.json guardado tras cada scan (gitignored)
  mock-evidence/        ← datos de prueba (gitignored)
frontend/
  src/App.jsx
  src/components/
    ScannerForm.jsx     ← input de ruta + dispara el scan
    SummaryCards.jsx    ← 5 cards: archivos, tamaño, tipos, carpetas vacías, errores calidad
    DownloadButtons.jsx ← descarga JSON y CSV del resultado actual (client-side)
    FileTypeChart.jsx   ← gráfico de barras por extensión
    QualityReport.jsx   ← secciones error/warning/info + acciones sugeridas
    FileTypeTable.jsx   ← tabla detalle por extensión
electron/
  main.js               ← maneja ciclo de vida, arranca backend, abre ventana
```

Orden de render: SummaryCards → DownloadButtons → FileTypeChart → QualityReport → FileTypeTable

## Integración con file-quality-report

`qualityAnalyzer.js` carga los módulos ESM de fqr via `dynamic import()` con `pathToFileURL` (necesario en Windows). Los módulos se cachean en primera llamada. El resultado se adjunta como `results.quality` en el JSON de salida.

El detector de duplicados skipea archivos >10MB para evitar bloquear el event loop con `readFileSync` en archivos grandes.

## JSON de salida (`results.json`)

```json
{
  "scannedPath": "...",
  "totalFiles": 20,
  "totalSizeBytes": 6030841,
  "emptyFolders": ["carpeta-vacia"],
  "byExtension": { ".pdf": { "count": 7, "totalSizeBytes": 6029768, "totalSizeMB": 5.75 } },
  "quality": {
    "summary": { "total": 8, "errors": 2, "warnings": 5, "infos": 1 },
    "sections": [{ "title": "Errores", "severity": "error", "items": ["..."] }],
    "suggestedActions": ["..."],
    "generatedAt": "...",
    "version": "1.0.0"
  }
}
```

## API Backend

| Endpoint | Qué hace |
|---|---|
| `POST /api/scan` | Escanea `{ path }`, guarda y devuelve resultados con `quality` |
| `GET /api/results` | Devuelve el último `outputs/results.json` |

## Descarga de reportes

Client-side desde el estado de React. El CSV usa `;` como separador y empieza con `sep=;` para compatibilidad con Excel en locale español.

## Correr en dev

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

## Build / distribución

```bash
cd frontend && npm run build   # genera frontend/dist/
cd electron && npm run build   # genera electron/dist-electron/*.exe
```

Electron Builder genera un `.exe` instalable (NSIS) y uno portable. Artefactos en `electron/dist-electron/`.
