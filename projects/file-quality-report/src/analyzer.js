// Módulo de análisis - orquesta todos los checks implementados en src/analyzer/
import { walkDirectory } from './walker.js';
import { runAllAnalyzers } from './analyzer/index.js';
import { resolve } from 'path';

/**
 * Analiza un directorio y ejecuta todos los checks
 * @param {string} dirPath - Ruta del directorio a analizar
 * @param {Object} options - Opciones de configuración
 * @param {Array<string>} options.allowedExtensions - Extensiones permitidas
 * @param {Object} options.size - Configuración de límites de tamaño
 * @param {number} options.size.minBytes - Tamaño mínimo en bytes
 * @param {number} options.size.maxBytes - Tamaño máximo en bytes
 * @returns {Object} Resultados consolidados del análisis
 */
export function analyzeDirectory(dirPath, options = {}) {
  const resolvedPath = resolve(dirPath);
  
  // 1. Recorrer directorio y obtener archivos
  const files = walkDirectory(resolvedPath, options);
  
  // 2. Ejecutar todos los analizadores
  const results = runAllAnalyzers(files, options);
  
  // 3. Devolver resultados consolidados
  return {
    directory: resolvedPath,
    totalFiles: files.length,
    results,
  };
}
