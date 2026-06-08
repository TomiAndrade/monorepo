const pdfParse = require('pdf-parse');
const fs = require('fs/promises');

const PDF_EXTENSIONS = new Set(['.pdf']);

async function extract(filePath) {
  const warnings = [];
  const data = {};

  try {
    const buffer = await fs.readFile(filePath);
    const parsed = await pdfParse(buffer);
    data.pageCount = parsed.numpages;
  } catch (err) {
    warnings.push(`PDF page count extraction failed: ${err.message}`);
  }

  return { data, warnings };
}

module.exports = { extract, PDF_EXTENSIONS };
