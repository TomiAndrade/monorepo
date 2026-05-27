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
  }
}
```

## Estructura del CSV de salida

Ejemplo real basado en el escaneo de `mock-evidence/`:

```
extension,fileCount,totalSizeBytes,totalSizeMB
.csv,2,158,0
.docx,2,161,0
.jpg,3,222,0
.json,1,77,0
.mp4,1,77,0
.pdf,3,237,0
.png,2,154,0
.txt,1,56,0
```

> Las filas están ordenadas alfabéticamente por extensión.

## Supuestos y limitaciones
- Los archivos sin extensión se agrupan bajo la clave `.no-extension`
- Archivos de 0 bytes muestran `0.00 MB` (es correcto, no es un error)
- No soporta rutas de red (UNC paths como `\\servidor\recurso`)
- Requiere permisos de lectura en el directorio escaneado; los subdirectorios sin permisos se omiten con una advertencia en consola
