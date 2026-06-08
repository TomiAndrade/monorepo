const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');

const FILES_DIR = path.join(__dirname, 'files');

// Injects a minimal EXIF APP1 segment into a JPEG buffer (Make = "TestCamera")
function buildExifJpeg(baseJpegBuffer) {
  const makeStr = Buffer.from('TestCamera\0');

  // TIFF (little-endian): header + 1 IFD entry (Make tag) + value
  const tiff = Buffer.alloc(26 + makeStr.length);
  tiff.write('II', 0, 'ascii');
  tiff.writeUInt16LE(42, 2);
  tiff.writeUInt32LE(8, 4);               // IFD0 at offset 8
  tiff.writeUInt16LE(1, 8);              // 1 entry
  tiff.writeUInt16LE(0x010F, 10);        // Make tag
  tiff.writeUInt16LE(2, 12);             // ASCII type
  tiff.writeUInt32LE(makeStr.length, 14);
  tiff.writeUInt32LE(26, 18);            // value at offset 26
  tiff.writeUInt32LE(0, 22);             // no next IFD
  makeStr.copy(tiff, 26);

  const app1Body = Buffer.concat([Buffer.from([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]), tiff]);
  const app1Length = Buffer.alloc(2);
  app1Length.writeUInt16BE(app1Body.length + 2);
  const app1 = Buffer.concat([Buffer.from([0xFF, 0xE1]), app1Length, app1Body]);

  return Buffer.concat([baseJpegBuffer.slice(0, 2), app1, baseJpegBuffer.slice(2)]);
}

// Returns the path to a known valid PDF bundled by pdf-parse (5 pages)
function validPdfSourcePath() {
  return require.resolve('pdf-parse/test/data/02-valid.pdf');
}

let _fixtures = null;

async function generateFixtures() {
  if (_fixtures) return _fixtures;

  await fs.mkdir(FILES_DIR, { recursive: true });

  // Valid JPEG (10×10, no EXIF)
  const validJpgPath = path.join(FILES_DIR, 'valid.jpg');
  const validJpgBuffer = await sharp({
    create: { width: 10, height: 10, channels: 3, background: { r: 255, g: 0, b: 0 } },
  }).jpeg().toBuffer();
  await fs.writeFile(validJpgPath, validJpgBuffer);

  // Valid JPEG with injected EXIF (Make = "TestCamera")
  const jpegWithExifPath = path.join(FILES_DIR, 'valid-with-exif.jpg');
  await fs.writeFile(jpegWithExifPath, buildExifJpeg(validJpgBuffer));

  // Valid PNG (10×10)
  const validPngPath = path.join(FILES_DIR, 'valid.png');
  await sharp({
    create: { width: 10, height: 10, channels: 4, background: { r: 0, g: 255, b: 0, alpha: 1 } },
  }).png().toFile(validPngPath);

  // Valid PDF (5 pages) — copied from pdf-parse's own test data
  const validPdfPath = path.join(FILES_DIR, 'valid.pdf');
  await fs.copyFile(validPdfSourcePath(), validPdfPath);

  // Corrupt image (random bytes with .jpg extension)
  const corruptJpgPath = path.join(FILES_DIR, 'corrupt.jpg');
  await fs.writeFile(corruptJpgPath, Buffer.from([0xDE, 0xAD, 0xBE, 0xEF]));

  // Corrupt PDF
  const corruptPdfPath = path.join(FILES_DIR, 'corrupt.pdf');
  await fs.writeFile(corruptPdfPath, Buffer.from([0xDE, 0xAD, 0xBE, 0xEF]));

  // Generic text file
  const textFilePath = path.join(FILES_DIR, 'document.txt');
  await fs.writeFile(textFilePath, 'Hello World');

  _fixtures = {
    validJpg: validJpgPath,
    jpegWithExif: jpegWithExifPath,
    validPng: validPngPath,
    validPdf: validPdfPath,
    corruptJpg: corruptJpgPath,
    corruptPdf: corruptPdfPath,
    textFile: textFilePath,
    dir: FILES_DIR,
  };

  return _fixtures;
}

module.exports = { generateFixtures, FILES_DIR };
