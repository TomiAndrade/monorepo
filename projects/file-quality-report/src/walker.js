// Recorre un directorio recursivamente y recopila archivos con sus stats
import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const DEFAULT_IGNORE = [
  'node_modules',
  '.git',
  'dist',
  'dist-electron',
  'release',
  '.DS_Store',
];

export function walkDirectory(dirPath, options = {}) {
  const {
    ignore = DEFAULT_IGNORE,
    maxDepth = Infinity,
    _currentDepth = 0,
  } = options;

  const resolvedDir = resolve(dirPath);
  const results = [];

  let entries;
  try {
    entries = readdirSync(resolvedDir, { withFileTypes: true });
  } catch (err) {
    throw new Error(`No se puede leer el directorio: ${resolvedDir}\n${err.message}`);
  }

  for (const entry of entries) {
    if (ignore.includes(entry.name)) continue;

    const fullPath = join(resolvedDir, entry.name);

    if (entry.isDirectory()) {
      if (_currentDepth < maxDepth) {
        const nested = walkDirectory(fullPath, {
          ignore,
          maxDepth,
          _currentDepth: _currentDepth + 1,
        });
        results.push(...nested);
      }
    } else if (entry.isFile()) {
      try {
        const stats = statSync(fullPath);
        results.push({ filePath: fullPath, stats });
      } catch {
        // Archivo inaccesible, se omite silenciosamente
      }
    }
  }

  return results;
}
