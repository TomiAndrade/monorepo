// Script de demostración del file-quality-report
import { walkDirectory } from '../src/walker.js';
import { runAllAnalyzers } from '../src/analyzer/index.js';
import { formatReport, printReport, saveJsonReport } from '../src/reporter/index.js';
import { resolve } from 'path';

const fixturesPath = resolve('test/fixtures');

console.log('🚀 Iniciando demo de file-quality-report...\n');
console.log(`📁 Analizando directorio: ${fixturesPath}\n`);

try {
  const files = walkDirectory(fixturesPath);
  const results = runAllAnalyzers(files, {
    allowedExtensions: ['.js', '.json', '.md', '.txt'],
    errorExtensions: ['.exe', '.bat'],
    size: { minBytes: 10, maxBytes: 1024 * 1024 },
  });
  const report = formatReport(results);

  const savedPath = saveJsonReport(report, 'outputs/demo-report.json');
  console.log(`💾 Reporte JSON guardado en: ${savedPath}\n`);

  printReport(report);
} catch (error) {
  console.error(`❌ Error durante la demo: ${error.message}`);
  process.exit(1);
}
