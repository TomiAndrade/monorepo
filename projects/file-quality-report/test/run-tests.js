// Test Runner - File Quality Report
// Ejecuta cada analyzer contra fixtures específicos
// Sin dependencias externas - solo Node.js built-ins

import { statSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { detectEmptyFiles } from '../src/analyzer/emptyFiles.js';
import { detectDuplicates } from '../src/analyzer/duplicates.js';
import { detectUnexpectedExtensions } from '../src/analyzer/unexpectedExtensions.js';
import { detectSizeOutliers } from '../src/analyzer/sizeOutliers.js';
import { detectMissingMetadata } from '../src/analyzer/missingMetadata.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, 'fixtures');

// Colores ANSI para output
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Helper para crear objetos de archivo simulados
function createFileObj(filePath, customStats = {}) {
  const stats = statSync(filePath);
  return {
    filePath,
    stats: {
      size: customStats.size ?? stats.size,
      mtime: customStats.mtime ?? stats.mtime,
      ...stats,
    },
  };
}

// ============================================
// TESTS
// ============================================

const tests = [];

// Test 1: emptyFiles
function testEmptyFiles() {
  const emptyFile = join(FIXTURES_DIR, 'empty', 'empty-file.txt');
  const files = [createFileObj(emptyFile)];
  const results = detectEmptyFiles(files);

  const passed = results.length === 1 &&
    results[0].type === 'empty' &&
    results[0].file.includes('empty-file.txt');

  return {
    name: 'emptyFiles',
    passed,
    details: passed
      ? `Detectado 1 archivo vacío`
      : `Esperado 1 resultado 'empty', obtenido: ${results.length}`,
  };
}
tests.push(testEmptyFiles);

// Test 2: duplicates
function testDuplicates() {
  const original = join(FIXTURES_DIR, 'duplicates', 'original.txt');
  const duplicate = join(FIXTURES_DIR, 'duplicates', 'duplicate.txt');
  const files = [createFileObj(original), createFileObj(duplicate)];
  const results = detectDuplicates(files);

  const passed = results.length === 1 &&
    results[0].type === 'duplicate' &&
    results[0].file.includes('duplicate.txt') &&
    results[0].message.includes('original.txt');

  return {
    name: 'duplicates',
    passed,
    details: passed
      ? `Detectado 1 duplicado (original.txt -> duplicate.txt)`
      : `Esperado 1 resultado 'duplicate', obtenido: ${results.length}`,
  };
}
tests.push(testDuplicates);

// Test 3: unexpectedExtensions
function testUnexpectedExtensions() {
  const video = join(FIXTURES_DIR, 'unexpected-extensions', 'video.mp4');
  const data = join(FIXTURES_DIR, 'unexpected-extensions', 'data.bin');
  const files = [createFileObj(video), createFileObj(data)];
  const results = detectUnexpectedExtensions(files);

  const hasMp4 = results.some(r => r.file.includes('video.mp4') && r.type === 'unexpected_extension');
  const hasBin = results.some(r => r.file.includes('data.bin') && r.type === 'unexpected_extension');
  const passed = results.length === 2 && hasMp4 && hasBin;

  return {
    name: 'unexpectedExtensions',
    passed,
    details: passed
      ? `Detectadas 2 extensiones inesperadas (.mp4, .bin)`
      : `Esperados 2 resultados, obtenidos: ${results.length} (mp4: ${hasMp4}, bin: ${hasBin})`,
  };
}
tests.push(testUnexpectedExtensions);

// Test 4: sizeOutliers (too_small)
function testSizeOutliers() {
  const tiny = join(FIXTURES_DIR, 'size-outliers', 'tiny.dat');
  const files = [createFileObj(tiny)];

  // Usar umbral bajo para el test (el archivo tiene 1 byte)
  const results = detectSizeOutliers(files, { minNonEmptyBytes: 5 });

  const passed = results.length === 1 &&
    results[0].type === 'too_small' &&
    results[0].file.includes('tiny.dat');

  return {
    name: 'sizeOutliers',
    passed,
    details: passed
      ? `Detectado archivo muy pequeño (1 byte < 5 bytes umbral)`
      : `Esperado 1 resultado 'too_small', obtenido: ${results.length}`,
  };
}
tests.push(testSizeOutliers);

// Test 4b: sizeOutliers (too_large) - requiere crear archivo temporal
function testSizeOutliersLarge() {
  const tempDir = join(FIXTURES_DIR, 'size-outliers');
  const tempFile = join(tempDir, 'temp-large-file.tmp');

  try {
    // Crear archivo temporal de ~1MB y testear con umbral de 500KB
    const content = Buffer.alloc(1024 * 1024, 'X'); // 1MB
    writeFileSync(tempFile, content);

    const files = [createFileObj(tempFile)];
    const results = detectSizeOutliers(files, { maxSizeBytes: 512 * 1024 }); // 512KB

    const passed = results.length === 1 &&
      results[0].type === 'too_large' &&
      results[0].file.includes('temp-large-file.tmp');

    // Limpiar
    rmSync(tempFile);

    return {
      name: 'sizeOutliers (large file)',
      passed,
      details: passed
        ? `Detectado archivo muy grande (1MB > 512KB umbral)`
        : `Esperado 1 resultado 'too_large', obtenido: ${results.length}`,
    };
  } catch (err) {
    // Limpiar en caso de error
    if (existsSync(tempFile)) rmSync(tempFile);
    return {
      name: 'sizeOutliers (large file)',
      passed: false,
      details: `Error: ${err.message}`,
    };
  }
}
tests.push(testSizeOutliersLarge);

// Test 5: missingMetadata (no_extension)
function testMissingMetadata() {
  const readme = join(FIXTURES_DIR, 'missing-metadata', 'README');
  const license = join(FIXTURES_DIR, 'missing-metadata', 'LICENSE');
  const files = [createFileObj(readme), createFileObj(license)];
  const results = detectMissingMetadata(files);

  const hasReadme = results.some(r => r.file.includes('README') && r.type === 'no_extension');
  const hasLicense = results.some(r => r.file.includes('LICENSE') && r.type === 'no_extension');
  const passed = results.length >= 2 && hasReadme && hasLicense;

  return {
    name: 'missingMetadata',
    passed,
    details: passed
      ? `Detectados 2 archivos sin extensión (README, LICENSE)`
      : `Esperados al menos 2 resultados 'no_extension', obtenidos: ${results.length}`,
  };
}
tests.push(testMissingMetadata);

// Test 5b: missingMetadata (invalid_date)
function testMissingMetadataDate() {
  const readme = join(FIXTURES_DIR, 'missing-metadata', 'README');

  // Simular archivo con fecha antigua (antes del 2000)
  const oldDate = new Date('1995-01-01');
  const files = [createFileObj(readme, { mtime: oldDate })];
  const results = detectMissingMetadata(files);

  const hasInvalidDate = results.some(r => r.type === 'invalid_date');
  const passed = hasInvalidDate;

  return {
    name: 'missingMetadata (invalid date)',
    passed,
    details: passed
      ? `Detectada fecha inválida (anterior al 2000)`
      : `Esperado resultado 'invalid_date', tipos obtenidos: ${results.map(r => r.type).join(', ')}`,
  };
}
tests.push(testMissingMetadataDate);

// ============================================
// RUNNER
// ============================================

function runTests() {
  console.log(`${COLORS.bold}═══════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}   FILE QUALITY REPORT - TEST RUNNER${COLORS.reset}`);
  console.log(`${COLORS.bold}═══════════════════════════════════════${COLORS.reset}`);
  console.log();

  let passed = 0;
  let failed = 0;

  for (const testFn of tests) {
    const result = testFn();
    const icon = result.passed ? `${COLORS.green}✔${COLORS.reset}` : `${COLORS.red}✖${COLORS.reset}`;
    const status = result.passed ? `${COLORS.green}PASS${COLORS.reset}` : `${COLORS.red}FAIL${COLORS.reset}`;

    console.log(`${icon} ${result.name}`);
    console.log(`   ${status}: ${result.details}`);
    console.log();

    if (result.passed) passed++;
    else failed++;
  }

  // Resumen
  const total = tests.length;
  console.log(`${COLORS.bold}═══════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}Resumen:${COLORS.reset}`);
  console.log(`  ${COLORS.green}Pass: ${passed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Fail: ${failed}${COLORS.reset}`);
  console.log(`  ${COLORS.bold}Total: ${total}${COLORS.reset}`);
  console.log(`${COLORS.bold}═══════════════════════════════════════${COLORS.reset}`);

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
