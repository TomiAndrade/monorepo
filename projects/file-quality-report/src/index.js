// Entry point del CLI - file-quality-report
// Flujo completo: walk → analyze → format → report

import { existsSync, statSync } from 'fs';
import { resolve } from 'path';
import { walkDirectory } from './walker.js';
import { runAllAnalyzers } from './analyzer/index.js';
import { formatReport, printReport, saveJsonReport } from './reporter/index.js';

function main() {
  // 1. Determinar directorio objetivo
  const hasJsonFlag = process.argv.includes('--json');
  const targetArg = process.argv[2];
  const targetDirectory = targetArg && targetArg !== '--json'
    ? targetArg
    : process.cwd();

  // 2. Validar que el directorio existe
  const resolvedPath = resolve(targetDirectory);
  if (!existsSync(resolvedPath)) {
    console.error(`❌ Error: El directorio no existe: ${targetDirectory}`);
    process.exit(1);
  }

  const stats = statSync(resolvedPath);
  if (!stats.isDirectory()) {
    console.error(`❌ Error: La ruta no es un directorio: ${targetDirectory}`);
    process.exit(1);
  }

  // 3. Mostrar mensaje de inicio
  console.log(`🔍 Scanning: ${resolvedPath}`);
  console.log();

  // 4. Ejecutar flujo: walk → analyze → format → report
  try {
    const files = walkDirectory(resolvedPath);
    const results = runAllAnalyzers(files);
    const report = formatReport(results);

    // 5. Guardar JSON si se solicitó
    if (hasJsonFlag) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputPath = `outputs/report-${timestamp}.json`;
      const savedPath = saveJsonReport(report, outputPath);
      console.log(`💾 Reporte JSON guardado en: ${savedPath}`);
      console.log();
    }

    // 6. Imprimir reporte en consola
    printReport(report);

    // 7. Mensaje de finalización
    console.log();
    console.log('✅ Analysis complete.');
  } catch (error) {
    console.error(`❌ Error durante el análisis: ${error.message}`);
    process.exit(1);
  }
}

main();

