// Módulo de generación de reportes
import { formatReport } from './reporter/formatter.js';
import { saveJsonReport } from './reporter/jsonReporter.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

/**
 * Genera un reporte estructurado a partir de los resultados del análisis
 * @param {Array} analysisResults - Resultados del análisis
 * @param {Object} options - Opciones de configuración
 * @param {string} options.format - Formato de salida: 'json' o 'txt' (default: 'json')
 * @param {string} options.directory - Directorio analizado (para incluir en el reporte)
 * @returns {Object|string} Reporte estructurado (objeto para JSON, string para txt)
 */
export function generateReport(analysisResults, options = {}) {
  const { format = 'json', directory } = options;
  
  // Formatear los resultados
  const formattedReport = formatReport(analysisResults);
  
  // Agregar metadatos adicionales
  const report = {
    ...formattedReport,
    generatedAt: new Date().toISOString(),
    directory: directory || process.cwd(),
  };
  
  if (format === 'txt') {
    return formatAsText(report);
  }
  
  return report;
}

/**
 * Formatea el reporte como texto plano legible
 * @param {Object} report - Reporte estructurado
 * @returns {string} Reporte en formato texto
 */
function formatAsText(report) {
  const { generatedAt, directory, summary, sections, suggestedActions } = report;
  
  let output = '';
  
  // Header
  output += '═══════════════════════════════════════\n';
  output += '   FILE QUALITY REPORT\n';
  output += '═══════════════════════════════════════\n\n';
  
  // Metadata
  output += `Generated: ${generatedAt}\n`;
  output += `Directory: ${directory}\n\n`;
  
  // Executive summary
  output += '───────────────────────────────────────\n';
  output += 'EXECUTIVE SUMMARY\n';
  output += '───────────────────────────────────────\n';
  output += `Total files analyzed: ${summary.total}\n`;
  output += `Total errors: ${summary.errors}\n`;
  output += `Total warnings: ${summary.warnings}\n`;
  output += `Total info: ${summary.infos}\n\n`;
  
  // Sections by issue type
  const issueSections = {
    emptyFiles: { title: 'Empty Files', icon: '⚠' },
    duplicates: { title: 'Duplicate Files', icon: '⚠' },
    unexpectedExtensions: { title: 'Unexpected Extensions', icon: '⚠' },
    sizeOutliers: { title: 'Size Outliers', icon: 'ℹ' },
    missingMetadata: { title: 'Missing Metadata', icon: '⚠' },
  };
  
  for (const section of sections) {
    output += `───────────────────────────────────────\n`;
    output += `${section.title.toUpperCase()}\n`;
    output += '───────────────────────────────────────\n';
    
    for (const item of section.items) {
      output += `  ${item}\n`;
    }
    output += '\n';
  }
  
  // Suggested actions
  output += '───────────────────────────────────────\n';
  output += 'SUGGESTED CLEANUP ACTIONS\n';
  output += '───────────────────────────────────────\n';
  for (const action of suggestedActions) {
    output += `  • ${action}\n`;
  }
  output += '\n';
  
  // Footer
  output += '═══════════════════════════════════════\n';
  output += `Total Issues: ${summary.total}\n`;
  output += '═══════════════════════════════════════\n';
  
  return output;
}

/**
 * Guarda el reporte en disco
 * @param {Object|string} report - Reporte a guardar (objeto o string)
 * @param {string} outputPath - Ruta donde guardar el archivo
 * @returns {string} Ruta absoluta del archivo guardado
 */
export function saveReport(report, outputPath) {
  const absolutePath = resolve(outputPath);
  
  // Crear directorio si no existe
  const dir = dirname(absolutePath);
  try {
    mkdirSync(dir, { recursive: true });
  } catch (err) {
    throw new Error(`No se pudo crear el directorio de salida: ${dir}\n${err.message}`);
  }
  
  // Determinar contenido basado en el tipo
  let content;
  if (typeof report === 'string') {
    content = report;
  } else {
    content = JSON.stringify(report, null, 2);
  }
  
  // Guardar archivo
  try {
    writeFileSync(absolutePath, content, 'utf-8');
  } catch (err) {
    throw new Error(`No se pudo escribir el archivo: ${absolutePath}\n${err.message}`);
  }
  
  return absolutePath;
}
