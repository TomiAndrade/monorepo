// Orquesta todos los módulos de análisis y devuelve los resultados unificados
import { detectEmptyFiles } from './emptyFiles.js';
import { detectUnexpectedExtensions } from './unexpectedExtensions.js';
import { detectDuplicates } from './duplicates.js';
import { detectSizeOutliers } from './sizeOutliers.js';
import { detectMissingMetadata } from './missingMetadata.js';

export function runAllAnalyzers(files, options = {}) {
  const results = [
    ...detectEmptyFiles(files),
    ...detectUnexpectedExtensions(files, options.allowedExtensions, options.errorExtensions),
    ...detectDuplicates(files),
    ...detectSizeOutliers(files, options.size),
    ...detectMissingMetadata(files),
  ];

  return results;
}
