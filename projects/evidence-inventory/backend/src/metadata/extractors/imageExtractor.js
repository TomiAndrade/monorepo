const sharp = require('sharp');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp', '.avif']);

let _exifr = null;
async function loadExifr() {
  if (!_exifr) {
    const mod = await import('exifr');
    _exifr = mod.default || mod;
  }
  return _exifr;
}

async function extract(filePath) {
  const warnings = [];
  const data = {};

  try {
    const meta = await sharp(filePath).metadata();
    data.width = meta.width;
    data.height = meta.height;
  } catch (err) {
    warnings.push(`Image dimensions extraction failed: ${err.message}`);
  }

  try {
    const exifr = await loadExifr();
    const exif = await exifr.parse(filePath);
    if (exif) data.exif = exif;
  } catch (err) {
    warnings.push(`EXIF extraction failed: ${err.message}`);
  }

  return { data, warnings };
}

module.exports = { extract, IMAGE_EXTENSIONS };
