// Detecta duplicados probables comparando hash MD5 del contenido
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

function hashFile(filePath) {
  try {
    const content = readFileSync(filePath);
    return createHash('md5').update(content).digest('hex');
  } catch {
    return null;
  }
}

export function detectDuplicates(files) {
  const hashMap = new Map();
  const results = [];

  for (const { filePath } of files) {
    const hash = hashFile(filePath);
    if (!hash) continue;

    if (hashMap.has(hash)) {
      results.push({
        type: 'duplicate',
        severity: 'warning',
        file: filePath,
        message: `Duplicado de: ${hashMap.get(hash)}`,
      });
    } else {
      hashMap.set(hash, filePath);
    }
  }

  return results;
}
