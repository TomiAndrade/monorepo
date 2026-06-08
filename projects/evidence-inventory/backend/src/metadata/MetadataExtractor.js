const path = require('path');
const { extract: extractImage, IMAGE_EXTENSIONS } = require('./extractors/imageExtractor');
const { extract: extractPdf, PDF_EXTENSIONS } = require('./extractors/pdfExtractor');
const { extract: extractVideo, VIDEO_EXTENSIONS } = require('./extractors/videoExtractor');

async function extractMetadata(filePath, stat) {
  const warnings = [];
  const ext = path.extname(filePath).toLowerCase();

  const base = {
    fileName: path.basename(filePath),
    extension: ext || '.no-extension',
    sizeBytes: stat.size,
    modifiedAt: stat.mtime.toISOString(),
  };

  let specific = {};

  try {
    if (IMAGE_EXTENSIONS.has(ext)) {
      const result = await extractImage(filePath);
      if (result.warnings.length) warnings.push(...result.warnings);
      specific = result.data;
    } else if (PDF_EXTENSIONS.has(ext)) {
      const result = await extractPdf(filePath);
      if (result.warnings.length) warnings.push(...result.warnings);
      specific = result.data;
    } else if (VIDEO_EXTENSIONS.has(ext)) {
      const result = await extractVideo(filePath);
      if (result.warnings.length) warnings.push(...result.warnings);
      specific = result.data;
    }
  } catch (err) {
    warnings.push(`Metadata extraction failed for ${path.basename(filePath)}: ${err.message}`);
  }

  const metadata = { ...base, ...specific };
  if (warnings.length > 0) metadata.warnings = warnings;

  return metadata;
}

module.exports = { extractMetadata };
