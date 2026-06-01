// Detecta archivos muy grandes o muy pequeños (sin ser vacíos)
const DEFAULTS = {
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  minSizeBytes: 1,                 // > 0 pero sospechosamente pequeño si < minNonEmpty
  minNonEmptyBytes: 10,            // menos de 10 bytes en un no-.gitkeep es raro
};

export function detectSizeOutliers(files, options = {}) {
  const { maxSizeBytes, minNonEmptyBytes } = { ...DEFAULTS, ...options };
  const results = [];

  for (const { filePath, stats } of files) {
    const { size } = stats;
    if (size === 0) continue; // ya lo cubre emptyFiles

    if (size > maxSizeBytes) {
      results.push({
        type: 'too_large',
        severity: 'error',
        file: filePath,
        message: `Archivo muy grande: ${(size / 1024 / 1024).toFixed(2)} MB (límite: ${maxSizeBytes / 1024 / 1024} MB)`,
      });
    } else if (size < minNonEmptyBytes && !filePath.endsWith('.gitkeep')) {
      results.push({
        type: 'too_small',
        severity: 'warning',
        file: filePath,
        message: `Archivo sospechosamente pequeño: ${size} bytes`,
      });
    }
  }

  return results;
}
