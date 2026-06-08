const fs = require('fs/promises');
const path = require('path');

const OUTPUTS_DIR = path.join(__dirname, '../../outputs');
const SUMMARY_FILE = path.join(OUTPUTS_DIR, 'summary.txt');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp', '.avif']);
const PDF_EXTS   = new Set(['.pdf']);
const VIDEO_EXTS = new Set(['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv']);

function formatBytes(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  if (bytes >= 1024)      return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

async function generateSummary(results) {
  let images = 0, pdfs = 0, videos = 0;
  for (const [ext, data] of Object.entries(results.byExtension)) {
    if (IMAGE_EXTS.has(ext)) images += data.count;
    else if (PDF_EXTS.has(ext)) pdfs += data.count;
    else if (VIDEO_EXTS.has(ext)) videos += data.count;
  }

  const q = results.quality?.summary ?? { total: 0, errors: 0, warnings: 0, infos: 0 };
  const pipelineErrors = results.pipelineErrors ?? [];

  const lines = [
    'Pipeline ejecutado correctamente',
    '',
    `Ruta escaneada:   ${results.scannedPath}`,
    `Fecha:            ${new Date().toLocaleString('es-AR')}`,
    '',
    `Archivos totales: ${results.totalFiles}`,
    `Tamaño total:     ${formatBytes(results.totalSizeBytes)}`,
    `Carpetas vacías:  ${results.emptyFolders.length}`,
    '',
    `Imágenes: ${images}`,
    `PDFs:     ${pdfs}`,
    `Videos:   ${videos}`,
    '',
    `Problemas de calidad: ${q.total}`,
    `  Errores:      ${q.errors}`,
    `  Advertencias: ${q.warnings}`,
    `  Info:         ${q.infos ?? 0}`,
  ];

  if (pipelineErrors.length > 0) {
    lines.push('');
    lines.push(`Errores en el pipeline: ${pipelineErrors.length}`);
    for (const e of pipelineErrors) {
      const fileLabel = e.file ? ` ${path.basename(e.file)} —` : '';
      lines.push(`  [${e.stage}]${fileLabel} ${e.message}`);
    }
  }

  const content = lines.join('\n') + '\n';
  await fs.mkdir(OUTPUTS_DIR, { recursive: true });
  await fs.writeFile(SUMMARY_FILE, content, 'utf-8');
  return content;
}

module.exports = { generateSummary };
