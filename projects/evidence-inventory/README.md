# Evidence Inventory

## Descripción
Herramienta para inventariar carpetas de evidencia industrial.  
Escanea directorios recursivamente y genera reportes por tipo de archivo.

## Requisitos
- Node.js v18+
- npm

## Instalación

### Backend
```bash
cd projects/evidence-inventory/backend
npm install
```

### Frontend
```bash
cd projects/evidence-inventory/frontend
npm install
```

## Uso

### 1. Generar datos mock (opcional)
```bash
cd backend
npm run mock
```

### 2. Iniciar backend
```bash
cd backend
npm start
# Corre en http://localhost:3001
```

### 3. Iniciar frontend
```bash
cd frontend
npm run dev
# Corre en http://localhost:5173
```

## Endpoints API
- `POST /api/scan` — Escanea un directorio. Body: `{ "path": "/ruta/a/escanear" }`
- `GET /api/results` — Retorna el último resultado guardado en `backend/outputs/results.json`

## Estructura del JSON de salida

Ejemplo real basado en el escaneo de `mock-evidence/`:

```json
{
  "scannedPath": "C:\\Users\\tomas\\monorepo\\projects\\evidence-inventory\\backend\\mock-evidence",
  "totalFiles": 15,
  "totalSizeBytes": 1142,
  "emptyFolders": [
    "carpeta-vacia"
  ],
  "byExtension": {
    ".jpg": { "count": 3, "totalSizeBytes": 222, "totalSizeMB": 0 },
    ".png": { "count": 2, "totalSizeBytes": 154, "totalSizeMB": 0 },
    ".pdf": { "count": 3, "totalSizeBytes": 237, "totalSizeMB": 0 },
    ".docx": { "count": 2, "totalSizeBytes": 161, "totalSizeMB": 0 },
    ".csv": { "count": 2, "totalSizeBytes": 158, "totalSizeMB": 0 },
    ".json": { "count": 1, "totalSizeBytes": 77, "totalSizeMB": 0 },
    ".mp4": { "count": 1, "totalSizeBytes": 77, "totalSizeMB": 0 },
    ".txt": { "count": 1, "totalSizeBytes": 56, "totalSizeMB": 0 }
  },
  "files": [
    {
      "path": "C:\\...\\mock-evidence\\foto.jpg",
      "type": ".jpg",
      "metadata": {
        "fileName": "foto.jpg",
        "extension": ".jpg",
        "sizeBytes": 74,
        "modifiedAt": "2024-06-15T08:00:00.000Z",
        "width": 10,
        "height": 10
      }
    },
    {
      "path": "C:\\...\\mock-evidence\\informe.pdf",
      "type": ".pdf",
      "metadata": {
        "fileName": "informe.pdf",
        "extension": ".pdf",
        "sizeBytes": 79,
        "modifiedAt": "2024-06-15T08:00:00.000Z",
        "pageCount": 1
      }
    }
  ],
  "quality": {
    "summary": { "total": 8, "errors": 2, "warnings": 5, "infos": 1 },
    "sections": [{ "title": "Errores", "severity": "error", "items": ["..."] }],
    "suggestedActions": ["..."],
    "generatedAt": "2026-06-08T15:30:00.000Z",
    "version": "1.0.0"
  }
}
```

> `pipelineErrors` es un campo opcional que solo aparece cuando algún extractor de metadata reporta advertencias. Contiene una lista plana de `{ stage, file, message, timestamp }`.


## Estructura del CSV de salida

Ejemplo real basado en el escaneo de `mock-evidence/`:

```
sep=;
extension;fileCount;totalSizeBytes;totalSizeMB
.csv;2;158;0
.docx;2;161;0
.jpg;3;222;0
.json;1;77;0
.mp4;1;77;0
.pdf;3;237;0
.png;2;154;0
.txt;1;56;0
```

> Las filas están ordenadas alfabéticamente por extensión.

## Pipeline de Ingesta y Validación

El pipeline ejecuta los siguientes pasos en secuencia cada vez que se llama a `POST /api/scan`:

1. **Inventario** — recorre el directorio recursivamente, contabiliza archivos por extensión y detecta carpetas vacías.
2. **Metadata** — extrae datos técnicos por tipo: dimensiones + EXIF (imágenes), páginas (PDFs), resolución + duración (videos, requiere `ffprobe`).
3. **Calidad** — aplica reglas configurables: archivos vacíos, extensiones prohibidas, tamaño excesivo.
4. **Persistencia** — guarda los resultados consolidados y genera los archivos de salida.

### Ejecución

```bash
# Lanzar el backend
cd projects/evidence-inventory/backend
npm start

# Desde otra terminal o desde la UI, disparar un scan:
# (PowerShell)
Invoke-RestMethod -Uri http://localhost:3001/api/scan `
  -Method POST -ContentType "application/json" `
  -Body '{"path":"C:\\ruta\\a\\escanear"}'
```

### Salidas generadas

| Archivo | Descripción |
|---|---|
| `outputs/results.json` | Resultado completo: inventario, metadata por archivo, calidad |
| `outputs/summary.txt` | Resumen legible: totales, tipos, problemas de calidad |
| `outputs/pipeline.log` | Log estructurado `[Pipeline][INFO/WARN/ERROR]` de cada ejecución |

### Ejemplo de summary.txt

```
Pipeline ejecutado correctamente

Ruta escaneada:   C:\proyecto\evidencias
Fecha:            08/06/2026, 15:30:00

Archivos totales: 291
Tamaño total:     2.17 GB
Carpetas vacías:  3

Imágenes: 54
PDFs:     46
Videos:   0

Problemas de calidad: 22
  Errores:      19
  Advertencias: 3
  Info:         0
```

---

## Supuestos y limitaciones
- Los archivos sin extensión se agrupan bajo la clave `.no-extension`
- Archivos de 0 bytes muestran `0.00 MB` (es correcto, no es un error)
- No soporta rutas de red (UNC paths como `\\servidor\recurso`)
- Requiere permisos de lectura en el directorio escaneado; los subdirectorios sin permisos se omiten con una advertencia en consola
