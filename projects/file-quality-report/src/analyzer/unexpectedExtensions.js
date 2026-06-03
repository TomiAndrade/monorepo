// Detecta extensiones no esperadas según una lista configurable
import { extname } from 'path';

const DEFAULT_ALLOWED = [
  '.js', '.ts', '.jsx', '.tsx',
  '.json', '.md', '.txt', '.csv',
  '.html', '.css', '.env', '.gitkeep',
  '.png', '.jpg', '.jpeg', '.svg', '.pdf',
];

export function detectUnexpectedExtensions(files, allowedExtensions = DEFAULT_ALLOWED, errorExtensions = []) {
  const allowed = allowedExtensions.map(e => e.toLowerCase());
  const errors = errorExtensions.map(e => e.toLowerCase());

  return files
    .filter(({ filePath }) => {
      const ext = extname(filePath).toLowerCase();
      return ext && !allowed.includes(ext);
    })
    .map(({ filePath }) => {
      const ext = extname(filePath).toLowerCase();
      const isError = errors.includes(ext);
      return {
        type: 'unexpected_extension',
        severity: isError ? 'error' : 'warning',
        file: filePath,
        message: `Extensión no esperada: ${extname(filePath)}`,
      };
    });
}
