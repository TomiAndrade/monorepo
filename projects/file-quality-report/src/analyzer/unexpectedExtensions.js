// Detecta extensiones no esperadas según una lista configurable
import { extname } from 'path';

const DEFAULT_ALLOWED = [
  '.js', '.ts', '.jsx', '.tsx',
  '.json', '.md', '.txt', '.csv',
  '.html', '.css', '.env', '.gitkeep',
  '.png', '.jpg', '.jpeg', '.svg', '.pdf',
];

export function detectUnexpectedExtensions(files, allowedExtensions = [], errorExtensions = []) {
  const errors = new Set(errorExtensions.map(e => e.toLowerCase()));
  const allowed = new Set([...DEFAULT_ALLOWED, ...allowedExtensions].map(e => e.toLowerCase()));

  const results = [];
  for (const { filePath } of files) {
    const ext = extname(filePath).toLowerCase();
    if (!ext) continue;
    if (errors.has(ext)) {
      results.push({
        type: 'unexpected_extension',
        severity: 'error',
        file: filePath,
        message: `Extensión no permitida: ${ext}`,
      });
    } else if (!allowed.has(ext)) {
      results.push({
        type: 'unexpected_extension',
        severity: 'warning',
        file: filePath,
        message: `Extensión no esperada: ${ext}`,
      });
    }
  }
  return results;
}
