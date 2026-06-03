// Script de demostración del file-quality-report
import { analyzeDirectory } from '../src/analyzer.js';
import { generateReport, saveReport } from '../src/reporter.js';
import { resolve } from 'path';

console.log('🚀 Iniciando demo de file-quality-report...\n');

// Configuración de opciones
const options = {
  allowedExtensions: ['.js', '.json', '.md', '.txt'],
  size: {
    minBytes: 10,
    maxBytes: 1024 * 1024, // 1MB
  },
};

// Directorio a analizar
const fixturesPath = resolve('test/fixtures');

console.log(`📁 Analizando directorio: ${fixturesPath}\n`);

try {
  // 1. Ejecutar análisis
  const analysisResults = analyzeDirectory(fixturesPath, options);
  console.log(`✅ Análisis completado: ${analysisResults.totalFiles} archivos encontrados\n`);
  
  // 2. Generar reporte en formato JSON
  const jsonReport = generateReport(analysisResults.results, {
    format: 'json',
    directory: analysisResults.directory,
  });
  
  const jsonPath = 'outputs/report.json';
  const savedJsonPath = saveReport(jsonReport, jsonPath);
  console.log(`💾 Reporte JSON guardado en: ${savedJsonPath}`);
  
  // 3. Generar reporte en formato TXT
  const txtReport = generateReport(analysisResults.results, {
    format: 'txt',
    directory: analysisResults.directory,
  });
  
  const txtPath = 'outputs/report.txt';
  const savedTxtPath = saveReport(txtReport, txtPath);
  console.log(`💾 Reporte TXT guardado en: ${savedTxtPath}\n`);
  
  // 4. Imprimir reporte TXT en consola
  console.log('═══════════════════════════════════════');
  console.log('REPORTE EN CONSOLA');
  console.log('═══════════════════════════════════════\n');
  console.log(txtReport);
  
  console.log('\n✅ Demo completado exitosamente');
} catch (error) {
  console.error(`❌ Error durante la demo: ${error.message}`);
  process.exit(1);
}
