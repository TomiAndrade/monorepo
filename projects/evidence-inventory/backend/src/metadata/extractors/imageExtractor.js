const sharp = require('sharp');
const exifr = require('exifr/dist/full.umd.cjs');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp', '.avif']);

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
    const exif = await exifr.parse(filePath);
    if (exif) data.exif = exif;
  } catch (err) {
    warnings.push(`EXIF extraction failed: ${err.message}`);
  }

  return { data, warnings };
}

module.exports = { extract, IMAGE_EXTENSIONS };
