// Detecta archivos vacíos (tamaño 0 bytes)
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export function detectEmptyFiles(files) {
  return files
    .filter(({ stats }) => stats.size === 0)
    .map(({ filePath }) => ({
      type: 'empty',
      severity: 'warning',
      file: filePath,
      message: 'Archivo vacío (0 bytes)',
    }));
}
