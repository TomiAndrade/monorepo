# File Quality Report

Herramienta CLI para analizar la calidad de archivos dentro de un directorio.

El objetivo es detectar problemas comunes que afectan la organización, mantenimiento y limpieza de repositorios o conjuntos de evidencia digital.

## Características

- **Archivos vacíos**: Detecta archivos con 0 bytes de contenido
- **Extensiones no esperadas**: Identifica extensiones fuera de una lista permitida
- **Duplicados probables**: Encuentra archivos con contenido idéntico (hash MD5)
- **Archivos muy grandes**: Alerta sobre archivos que exceden el tamaño máximo (10 MB)
- **Archivos muy pequeños**: Detecta archivos sospechosamente pequeños (< 10 bytes)
- **Metadata faltante**: Identifica archivos sin extensión o con fechas inválidas

### Funcionalidades adicionales

- Reportes legibles en consola con colores y formato estructurado
- Exportación de resultados en formato JSON
- Ignorado automático de archivos técnicos (`.gitkeep`, `desktop.ini`, `Thumbs.db`)
- Exclusión de directorios de dependencias y build (`node_modules`, `.git`, `dist`)
- Acciones sugeridas basadas en los problemas detectados

---

## Estructura del proyecto

```text
file-quality-report/
├── src/
│   ├── analyzer/
│   │   ├── duplicates.js         # Detector de duplicados (hash MD5)
│   │   ├── emptyFiles.js         # Detector de archivos vacíos
│   │   ├── missingMetadata.js    # Detector de metadata faltante
│   │   ├── sizeOutliers.js       # Detector de archivos grandes/pequeños
│   │   ├── unexpectedExtensions.js # Detector de extensiones no esperadas
│   │   └── index.js              # Orquestador de analyzers
│   │
│   ├── reporter/
│   │   ├── formatter.js          # Formateador de reportes
│   │   ├── consoleReporter.js    # Reporte a consola (colores ANSI)
│   │   ├── jsonReporter.js       # Exportador a JSON
│   │   └── index.js              # Exportaciones del módulo
│   │
│   ├── walker.js                 # Recorredor de directorios
│   └── index.js                  # Entry point CLI
│
├── docs/
│   └── validation-rules.md       # Documentación técnica de reglas
│
├── test/
│   ├── fixtures/                 # Archivos de prueba para cada caso
│   │   ├── empty/                # Archivos vacíos
│   │   ├── duplicates/           # Archivos duplicados
│   │   ├── unexpected-extensions/# Extensiones no permitidas
│   │   ├── size-outliers/        # Archivos grandes/pequeños
│   │   └── missing-metadata/     # Sin extensión o fecha inválida
│   └── run-tests.js              # Test runner (sin dependencias)
│
├── outputs/                      # Reportes JSON generados
└── README.md                     # Este archivo
```

---

## Requisitos

- Node.js 18 o superior
- Sistema operativo compatible con Node.js (Windows, macOS, Linux)

---

## Instalación

No requiere instalación de dependencias. El proyecto usa solo módulos built-in de Node.js.

```bash
# Clonar o copiar el proyecto
cd projects/file-quality-report

# Verificar versión de Node.js
node --version  # Debe ser 18 o superior
```

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

## Uso con --json

Para exportar el reporte en formato JSON, agrega la flag `--json`:

```bash
# Analizar directorio actual y exportar JSON
node src/index.js . --json

# Analizar directorio específico y exportar JSON
node src/index.js ./ruta/al/directorio --json
```

El reporte JSON se guarda automáticamente en:

```text
outputs/report-{timestamp}.json
```

Ejemplo de nombre generado:

```text
outputs/report-2026-06-01T18-45-10-000Z.json
```

### Estructura del JSON

El archivo JSON incluye:
- `summary`: Totales por severidad (errors, warnings, infos)
- `sections`: Array de secciones con título, severidad e ítems
- `suggestedActions`: Lista de acciones recomendadas
- `generatedAt`: Timestamp de generación
- `version`: Versión del formato de reporte

---

## Configuración de extensiones

El comportamiento de detección de extensiones se puede ajustar creando un archivo `fqr.config.json` en el directorio a analizar (o en el directorio desde donde se corre el comando).

### Crear el archivo de configuración

```bash
# En el directorio que querés analizar
touch fqr.config.json
```

```json
{
  "allowedExtensions": [
    ".js", ".ts", ".jsx", ".tsx",
    ".json", ".md", ".txt", ".csv",
    ".html", ".css", ".env", ".gitkeep",
    ".png", ".jpg", ".jpeg", ".svg", ".pdf"
  ],
  "errorExtensions": [
    ".exe", ".bat", ".cmd", ".dll",
    ".sh", ".ps1"
  ]
}
```

> Ver [`fqr.config.example.json`](fqr.config.example.json) como punto de partida.

### Opciones disponibles

| Campo | Tipo | Descripción |
|---|---|---|
| `allowedExtensions` | `string[]` | Extensiones que **no** se reportan. Reemplaza la lista por defecto si se define. |
| `errorExtensions` | `string[]` | Extensiones que se reportan como **Error** en vez de Warning. |

### Comportamiento según configuración

| Situación | Severidad |
|---|---|
| Extensión en `allowedExtensions` | No se reporta |
| Extensión fuera de `allowedExtensions` | **Warning** |
| Extensión fuera de `allowedExtensions` y dentro de `errorExtensions` | **Error** |

### Ejemplo

Con la config de arriba, un archivo `setup.exe` se reportaría como **Error** en lugar de Warning, porque `.exe` está en `errorExtensions`.

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

### Resumen de severidades

| Regla | Tipo | Severidad | Descripción |
| ----- | ---- | --------- | ----------- |
| Archivo vacío | `empty` | **Error** | Archivo con tamaño de 0 bytes |
| Duplicado probable | `duplicate` | **Error** | Archivo con contenido idéntico a otro (hash MD5) |
| Archivo muy grande | `too_large` | **Warning** | Archivo > 10 MB |
| Extensión inesperada | `unexpected_extension` | **Warning** / **Error** | Extensión no en lista permitida (Error si está en `errorExtensions`) |
| Metadata faltante | `no_extension` | **Warning** | Archivo sin extensión |
| Fecha inválida | `invalid_date` | **Warning** | Fecha de modificación < año 2000 |
| Archivo muy pequeño | `too_small` | **Info** | Archivo no vacío < 10 bytes |

### Criterios detallados

**Extensiones permitidas por defecto:**
`.js`, `.ts`, `.jsx`, `.tsx`, `.json`, `.md`, `.txt`, `.csv`, `.html`, `.css`, `.env`, `.gitkeep`, `.png`, `.jpg`, `.jpeg`, `.svg`, `.pdf`

**Umbrellas de tamaño:**
- Máximo: 10 MB (`10 * 1024 * 1024` bytes)
- Mínimo informativo: 10 bytes (`minNonEmptyBytes`)

Para documentación técnica completa, ver: [`docs/validation-rules.md`](docs/validation-rules.md)

---

## Testing

El proyecto incluye un test runner propio sin dependencias externas.

### Ejecutar tests

```bash
node test/run-tests.js
```

### Casos de prueba incluidos

| Test | Descripción |
|------|-------------|
| `emptyFiles` | Detecta archivos con 0 bytes |
| `duplicates` | Detecta archivos con contenido idéntico |
| `unexpectedExtensions` | Detecta extensiones no permitidas (.mp4, .bin) |
| `sizeOutliers` | Detecta archivos muy pequeños (< 10 bytes) |
| `sizeOutliers (large file)` | Detecta archivos muy grandes (> umbral) |
| `missingMetadata` | Detecta archivos sin extensión |
| `missingMetadata (invalid date)` | Detecta archivos con fecha < 2000 |

### Fixtures de prueba

Los archivos de prueba se encuentran en `test/fixtures/`:

```
test/fixtures/
├── empty/empty-file.txt              # Archivo vacío (0 bytes)
├── duplicates/original.txt           # Archivo original
├── duplicates/duplicate.txt          # Duplicado (mismo contenido)
├── unexpected-extensions/video.mp4   # Extensión no permitida
├── unexpected-extensions/data.bin   # Extensión no permitida
├── size-outliers/tiny.dat           # Archivo de 1 byte
└── missing-metadata/README          # Sin extensión
└── missing-metadata/LICENSE         # Sin extensión
```

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

- ~~Configuración mediante archivo JSON~~ ✅
- Reglas personalizables
- Reportes HTML
- Integración con Evidence Inventory
- Métricas históricas de calidad
- Modo CI/CD

---

## Estado

✅ **Definition of Done completado**

- [x] Walker funcional con exclusión de archivos placeholder
- [x] 5 analyzers funcionales (empty, duplicates, extensions, size, metadata)
- [x] Reporter consola + JSON
- [x] CLI integrado
- [x] Documentación de reglas de validación (`docs/validation-rules.md`)
- [x] Casos de prueba incluidos (`test/fixtures/` y `test/run-tests.js`)

Versión actual: **0.1.0**