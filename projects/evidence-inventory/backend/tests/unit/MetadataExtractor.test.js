jest.mock('../../src/metadata/extractors/imageExtractor', () => ({
  IMAGE_EXTENSIONS: new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp', '.avif']),
  extract: jest.fn(),
}));
jest.mock('../../src/metadata/extractors/pdfExtractor', () => ({
  PDF_EXTENSIONS: new Set(['.pdf']),
  extract: jest.fn(),
}));
jest.mock('../../src/metadata/extractors/videoExtractor', () => ({
  VIDEO_EXTENSIONS: new Set(['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv']),
  extract: jest.fn(),
}));

const { extractMetadata } = require('../../src/metadata/MetadataExtractor');
const { extract: extractImage } = require('../../src/metadata/extractors/imageExtractor');
const { extract: extractPdf }   = require('../../src/metadata/extractors/pdfExtractor');
const { extract: extractVideo } = require('../../src/metadata/extractors/videoExtractor');

const MOCK_STAT = {
  size: 2048,
  mtime: new Date('2024-06-15T08:00:00.000Z'),
};

beforeEach(() => {
  jest.clearAllMocks();
  extractImage.mockResolvedValue({ data: {}, warnings: [] });
  extractPdf.mockResolvedValue({ data: {}, warnings: [] });
  extractVideo.mockResolvedValue({ data: {}, warnings: [] });
});

describe('MetadataExtractor — base metadata', () => {
  test('includes fileName', async () => {
    const r = await extractMetadata('/path/to/image.jpg', MOCK_STAT);
    expect(r.fileName).toBe('image.jpg');
  });

  test('includes extension', async () => {
    const r = await extractMetadata('/path/to/image.jpg', MOCK_STAT);
    expect(r.extension).toBe('.jpg');
  });

  test('includes sizeBytes from stat', async () => {
    const r = await extractMetadata('/path/to/image.jpg', MOCK_STAT);
    expect(r.sizeBytes).toBe(2048);
  });

  test('includes modifiedAt as ISO string', async () => {
    const r = await extractMetadata('/path/to/image.jpg', MOCK_STAT);
    expect(r.modifiedAt).toBe('2024-06-15T08:00:00.000Z');
  });

  test('uses .no-extension for files without extension', async () => {
    const r = await extractMetadata('/path/to/Makefile', MOCK_STAT);
    expect(r.extension).toBe('.no-extension');
  });
});

describe('MetadataExtractor — routing', () => {
  test('delegates to imageExtractor for .jpg', async () => {
    extractImage.mockResolvedValue({ data: { width: 800, height: 600 }, warnings: [] });
    const r = await extractMetadata('/img/photo.jpg', MOCK_STAT);
    expect(extractImage).toHaveBeenCalledWith('/img/photo.jpg');
    expect(r.width).toBe(800);
    expect(r.height).toBe(600);
  });

  test('delegates to imageExtractor for .png', async () => {
    extractImage.mockResolvedValue({ data: { width: 100, height: 100 }, warnings: [] });
    await extractMetadata('/img/logo.png', MOCK_STAT);
    expect(extractImage).toHaveBeenCalledWith('/img/logo.png');
    expect(extractPdf).not.toHaveBeenCalled();
    expect(extractVideo).not.toHaveBeenCalled();
  });

  test('delegates to pdfExtractor for .pdf', async () => {
    extractPdf.mockResolvedValue({ data: { pageCount: 12 }, warnings: [] });
    const r = await extractMetadata('/docs/report.pdf', MOCK_STAT);
    expect(extractPdf).toHaveBeenCalledWith('/docs/report.pdf');
    expect(r.pageCount).toBe(12);
  });

  test('delegates to videoExtractor for .mp4', async () => {
    extractVideo.mockResolvedValue({ data: { durationSeconds: 90.5, width: 1280, height: 720 }, warnings: [] });
    const r = await extractMetadata('/vids/clip.mp4', MOCK_STAT);
    expect(extractVideo).toHaveBeenCalledWith('/vids/clip.mp4');
    expect(r.durationSeconds).toBe(90.5);
  });

  test('does not call any specific extractor for generic files', async () => {
    const r = await extractMetadata('/path/notes.docx', MOCK_STAT);
    expect(extractImage).not.toHaveBeenCalled();
    expect(extractPdf).not.toHaveBeenCalled();
    expect(extractVideo).not.toHaveBeenCalled();
    expect(r.warnings).toBeUndefined();
  });
});

describe('MetadataExtractor — warnings', () => {
  test('warnings array is included when extractor reports warnings', async () => {
    extractImage.mockResolvedValue({ data: {}, warnings: ['EXIF extraction failed: Unknown file format'] });
    const r = await extractMetadata('/img/broken.jpg', MOCK_STAT);
    expect(r.warnings).toEqual(['EXIF extraction failed: Unknown file format']);
  });

  test('no warnings property when extraction is clean', async () => {
    extractImage.mockResolvedValue({ data: { width: 10, height: 10 }, warnings: [] });
    const r = await extractMetadata('/img/clean.jpg', MOCK_STAT);
    expect(r.warnings).toBeUndefined();
  });

  test('captures unexpected extractor errors as warnings without throwing', async () => {
    extractImage.mockRejectedValue(new Error('Unexpected crash in extractor'));
    const r = await extractMetadata('/img/bad.jpg', MOCK_STAT);
    expect(r.warnings).toBeDefined();
    expect(r.warnings.some(w => w.includes('Metadata extraction failed'))).toBe(true);
  });

  test('merges multiple warnings from extractor', async () => {
    extractImage.mockResolvedValue({
      data: {},
      warnings: ['Image dimensions extraction failed: bad format', 'EXIF extraction failed: Unknown file format'],
    });
    const r = await extractMetadata('/img/bad.jpg', MOCK_STAT);
    expect(r.warnings).toHaveLength(2);
  });
});
