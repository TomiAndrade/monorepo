# evidence-inventory — Claude Context

App de escritorio (Electron) para inventariar carpetas de evidencia industrial. Escanea directorios recursivamente y genera reportes por tipo de archivo.

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
  src/index.js     ← Express server (puerto 3001)
  src/scanner.js   ← lógica de escaneo de directorio
  outputs/         ← results.json guardado tras cada scan (gitignored)
  mock-evidence/   ← datos de prueba (gitignored)
frontend/
  src/App.jsx
  src/components/  ← ScannerForm, SummaryCards, FileTypeChart, FileTypeTable
electron/
  main.js          ← maneja ciclo de vida, arranca backend, abre ventana
```

## API Backend

| Endpoint | Qué hace |
|---|---|
| `POST /api/scan` | Escanea `{ path }`, guarda y devuelve resultados |
| `GET /api/results` | Devuelve el último `outputs/results.json` |

## Correr en dev

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev

# Terminal 3 (opcional, solo Electron shell)
cd electron && npx electron .
```

## Build / distribución

Electron Builder genera un `.exe` instalable (NSIS) con backend embebido.
Config en `electron/package.json`. Artefactos en `electron/release/`.
