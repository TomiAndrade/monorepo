// Detecta archivos sin fecha de modificación confiable o sin extensión
import { extname, basename } from 'path';

export function detectMissingMetadata(files) {
  const results = [];
  const epoch = new Date('2000-01-01');

  for (const { filePath, stats } of files) {
    // Sin extensión (y no es un dotfile conocido)
    const name = basename(filePath);
    const ext = extname(filePath);
    if (!ext && !name.startsWith('.')) {
      results.push({
        type: 'no_extension',
        severity: 'warning',
        file: filePath,
        message: 'Archivo sin extensión',
      });
    }

    // Fecha de modificación muy antigua o inválida
    if (!stats.mtime || stats.mtime < epoch) {
      results.push({
        type: 'invalid_date',
        severity: 'warning',
        file: filePath,
        message: `Fecha de modificación inválida o anterior al año 2000: ${stats.mtime}`,
      });
    }
  }

  return results;
}
