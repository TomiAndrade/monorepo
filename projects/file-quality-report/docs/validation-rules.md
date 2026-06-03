# Reglas de Validación - File Quality Report

Documentación técnica de las reglas de validación implementadas por el analizador.

## Tabla de Reglas

| Regla | Tipo | Severidad | Descripción |
| ----- | ---- | --------- | ----------- |
| `empty` | Archivo vacío | Error | Archivo con tamaño de 0 bytes |
| `duplicate` | Duplicado probable | Error | Archivo con contenido idéntico a otro (hash MD5) |
| `too_large` | Archivo muy grande | Warning | Archivo que excede el tamaño máximo permitido (10 MB) |
| `unexpected_extension` | Extensión inesperada | Warning | Extensión no incluida en la lista de permitidas |
| `no_extension` | Sin extensión | Warning | Archivo sin extensión (excluyendo dotfiles) |
| `invalid_date` | Fecha inválida | Warning | Fecha de modificación anterior al año 2000 |
| `too_small` | Archivo muy pequeño | Info | Archivo menor a 10 bytes (excluyendo .gitkeep) |

---

## Criterios por Detector

### 1. emptyFiles

**Archivo:** `src/analyzer/emptyFiles.js`

**Criterio:**
- Tamaño del archivo (`stats.size`) igual a 0 bytes

**Detalles técnicos:**
```javascript
files.filter(({ stats }) => stats.size === 0)
```

**Acción sugerida:**
- Eliminar archivos vacíos o agregarles contenido relevante

---

### 2. duplicates

**Archivo:** `src/analyzer/duplicates.js`

**Criterio:**
- Hash MD5 idéntico entre dos o más archivos

**Detalles técnicos:**
```javascript
const hash = createHash('md5').update(content).digest('hex');
```

- El primer archivo con un hash determinado se considera "original"
- Los archivos subsiguientes con el mismo hash se reportan como duplicados
- El mensaje incluye la ruta del archivo original

**Acción sugerida:**
- Eliminar duplicados probables conservando solo una copia

---

### 3. unexpectedExtensions

**Archivo:** `src/analyzer/unexpectedExtensions.js`

**Criterio:**
- Extensión del archivo no está en la lista de permitidas

**Extensiones permitidas por defecto:**
```javascript
[
  '.js', '.ts', '.jsx', '.tsx',
  '.json', '.md', '.txt', '.csv',
  '.html', '.css', '.env', '.gitkeep',
  '.png', '.jpg', '.jpeg', '.svg', '.pdf',
]
```

**Detalles técnicos:**
- La comparación es case-insensitive (`.MP4` = `.mp4`)
- Archivos sin extensión no son evaluados por este detector

**Acción sugerida:**
- Revisar archivos con extensiones no esperadas y moverlos o renombrarlos

---

### 4. sizeOutliers

**Archivo:** `src/analyzer/sizeOutliers.js`

**Criterios:**

| Condición | Umbral | Severidad |
|-----------|--------|-----------|
| Archivo muy grande | > 10 MB (10 * 1024 * 1024 bytes) | Warning |
| Archivo muy pequeño | < 10 bytes (y no es .gitkeep) | Info |

**Valores por defecto:**
```javascript
{
  maxSizeBytes: 10 * 1024 * 1024,  // 10 MB
  minSizeBytes: 1,                  // > 0
  minNonEmptyBytes: 10,            // umbral para "muy pequeño"
}
```

**Notas:**
- Los archivos vacíos (0 bytes) son excluidos (ya cubiertos por `emptyFiles`)
- `.gitkeep` está excluido de la regla de archivos pequeños

**Acciones sugeridas:**
- Considerar comprimir o mover archivos muy grandes a almacenamiento externo
- Revisar archivos sospechosamente pequeños

---

### 5. missingMetadata

**Archivo:** `src/analyzer/missingMetadata.js`

**Criterios:**

| Condición | Detalle | Severidad |
|-----------|---------|-----------|
| Sin extensión | Sin punto en el nombre (excepto dotfiles que empiezan con `.`) | Warning |
| Fecha inválida | `mtime` anterior al 1 de enero de 2000 | Warning |

**Detalles técnicos:**
```javascript
const epoch = new Date('2000-01-01');
// Fecha inválida: stats.mtime < epoch
```

**Acción sugerida:**
- Agregar extensiones a archivos sin extensión o revisar fechas de modificación

---

## Remapeo de Severidades

El archivo `src/reporter/formatter.js` realiza un remapeo de severidades según la especificación del proyecto:

| Tipo de regla | Severidad original | Severidad final |
|---------------|-------------------|-----------------|
| `empty` | `warning` | `error` |
| `duplicate` | `warning` | `error` |
| `unexpected_extension` | `warning` | `warning` |
| `too_large` | `error` | `warning` |
| `too_small` | `warning` | `info` |
| `no_extension` | `warning` | `warning` |
| `invalid_date` | `warning` | `warning` |

---

## Ejemplo de Salida de Reporte

### Salida en Consola

```text
═══════════════════════════════════════
   FILE QUALITY REPORT
═══════════════════════════════════════

✖ Errores
---------
  /project/data/backup.log: Archivo vacío (0 bytes)
  /project/docs/copy.txt: Duplicado de: /project/docs/original.txt

⚠ Advertencias
--------------
  /project/assets/video.mp4: Extensión no esperada: .mp4
  /project/data/large.zip: Archivo muy grande: 15.50 MB (límite: 10 MB)
  /project/config/README: Archivo sin extensión
  /project/old/file.txt: Fecha de modificación inválida o anterior al año 2000: 1995-01-01T00:00:00.000Z

ℹ Información
-------------
  /project/tiny/bytes.dat: Archivo sospechosamente pequeño: 5 bytes

Acciones sugeridas:
  • Eliminar archivos vacíos o agregarles contenido relevante
  • Revisar archivos con extensiones no esperadas y moverlos o renombrarlos
  • Eliminar duplicados probables conservando solo una copia
  • Considerar comprimir o mover archivos muy grandes a almacenamiento externo
  • Agregar extensiones a archivos sin extensión o revisar fechas de modificación

═══════════════════════════════════════
Resumen:
  Errores: 2
  Advertencias: 4
  Informativos: 1
  Total: 7
═══════════════════════════════════════
```

### Salida JSON (estructura)

```json
{
  "summary": {
    "total": 7,
    "errors": 2,
    "warnings": 4,
    "infos": 1
  },
  "sections": [
    {
      "title": "Errores",
      "severity": "error",
      "items": [
        "/project/data/backup.log: Archivo vacío (0 bytes)",
        "/project/docs/copy.txt: Duplicado de: /project/docs/original.txt"
      ]
    },
    {
      "title": "Advertencias",
      "severity": "warning",
      "items": [
        "/project/assets/video.mp4: Extensión no esperada: .mp4",
        "/project/data/large.zip: Archivo muy grande: 15.50 MB (límite: 10 MB)",
        "/project/config/README: Archivo sin extensión",
        "/project/old/file.txt: Fecha de modificación inválida o anterior al año 2000: 1995-01-01T00:00:00.000Z"
      ]
    },
    {
      "title": "Información",
      "severity": "info",
      "items": [
        "/project/tiny/bytes.dat: Archivo sospechosamente pequeño: 5 bytes"
      ]
    }
  ],
  "suggestedActions": [
    "Eliminar archivos vacíos o agregarles contenido relevante",
    "Revisar archivos con extensiones no esperadas y moverlos o renombrarlos",
    "Eliminar duplicados probables conservando solo una copia",
    "Considerar comprimir o mover archivos muy grandes a almacenamiento externo",
    "Agregar extensiones a archivos sin extensión o revisar fechas de modificación"
  ],
  "generatedAt": "2026-06-01T18:45:10.000Z",
  "version": "1.0.0"
}
```

---

## Archivos Ignorados

El walker excluye automáticamente los siguientes elementos:

### Directorios ignorados
- `node_modules`
- `.git`
- `dist`
- `dist-electron`
- `release`
- `.DS_Store`

### Archivos ignorados
- `.gitkeep`
- `desktop.ini`
- `Thumbs.db`
