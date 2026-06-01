# file-quality-report

Herramienta CLI para análisis de calidad de archivos.

## Qué detecta
- Archivos vacíos
- Extensiones no esperadas
- Duplicados probables (por hash)
- Archivos muy grandes o muy pequeños
- Archivos sin metadata mínima

## Uso
```bash
node src/index.js --dir ./ruta/al/directorio
```

## Output
Genera un reporte con warnings, errores y acciones de limpieza sugeridas en `outputs/`.
