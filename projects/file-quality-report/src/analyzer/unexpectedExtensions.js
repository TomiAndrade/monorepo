// Detecta extensiones no esperadas según una lista configurable
import { extname } from 'path';

const DEFAULT_ALLOWED = [
  '.js', '.ts', '.jsx', '.tsx',
  '.json', '.md', '.txt', '.csv',
  '.html', '.css', '.env', '.gitkeep',
  '.png', '.jpg', '.jpeg', '.svg', '.pdf',
];

export function detectUnexpectedExtensions(files, allowedExtensions = DEFAULT_ALLOWED) {
  return files
    .filter(({ filePath }) => {
      const ext = extname(filePath).toLowerCase();
      return ext && !allowedExtensions.includes(ext);
    })
    .map(({ filePath }) => ({
      type: 'unexpected_extension',
      severity: 'warning',
      file: filePath,
      message: `Extensión no esperada: ${extname(filePath)}`,
    }));
}
