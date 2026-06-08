// qualityAnalyzer uses ESM dynamic imports incompatible with Jest's CJS runtime
jest.mock('../../src/qualityAnalyzer', () => ({
  analyzeQuality: jest.fn().mockResolvedValue({
    summary: { total: 0, errors: 0, warnings: 0, infos: 0 },
    sections: [],
    suggestedActions: [],
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
  }),
}));

const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const { scanDirectory } = require('../../src/scanner');
const { generateFixtures } = require('../fixtures/generate');

let tempDir;
let results;

beforeAll(async () => {
  const F = await generateFixtures();

  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'evidence-meta-test-'));

  await fs.copyFile(F.validJpg,    path.join(tempDir, 'valid.jpg'));
  await fs.copyFile(F.validPdf,    path.join(tempDir, 'valid.pdf'));
  await fs.copyFile(F.corruptJpg,  path.join(tempDir, 'corrupt.jpg'));
  await fs.writeFile(path.join(tempDir, 'document.txt'), 'text content');

  results = await scanDirectory(tempDir);
});

afterAll(async () => {
  if (tempDir) await fs.rm(tempDir, { recursive: true, force: true });
});

describe('metadata pipeline — shape', () => {
  test('result includes files array', () => {
    expect(Array.isArray(results.files)).toBe(true);
  });

  test('files count equals totalFiles', () => {
    expect(results.files.length).toBe(results.totalFiles);
  });

  test('each item has path, type and metadata', () => {
    for (const file of results.files) {
      expect(typeof file.path).toBe('string');
      expect(typeof file.type).toBe('string');
      expect(file.metadata).toBeDefined();
    }
  });
});

describe('metadata pipeline — base fields present on every file', () => {
  test('all files have fileName', () => {
    for (const file of results.files) {
      expect(file.metadata.fileName).toBeDefined();
    }
  });

  test('all files have extension', () => {
    for (const file of results.files) {
      expect(file.metadata.extension).toBeDefined();
    }
  });

  test('all files have sizeBytes as a number', () => {
    for (const file of results.files) {
      expect(typeof file.metadata.sizeBytes).toBe('number');
    }
  });

  test('all files have modifiedAt as ISO 8601 string', () => {
    for (const file of results.files) {
      expect(file.metadata.modifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });
});

describe('metadata pipeline — type-specific metadata', () => {
  test('valid JPEG has width and height, no warnings', () => {
    const f = results.files.find(f => path.basename(f.path) === 'valid.jpg');
    expect(f.metadata.width).toBe(10);
    expect(f.metadata.height).toBe(10);
    expect(f.metadata.warnings).toBeUndefined();
  });

  test('valid PDF has pageCount, no warnings', () => {
    const f = results.files.find(f => path.basename(f.path) === 'valid.pdf');
    expect(typeof f.metadata.pageCount).toBe('number');
    expect(f.metadata.pageCount).toBeGreaterThan(0);
    expect(f.metadata.warnings).toBeUndefined();
  });

  test('generic .txt file has only base metadata', () => {
    const f = results.files.find(f => path.basename(f.path) === 'document.txt');
    expect(f.metadata.width).toBeUndefined();
    expect(f.metadata.pageCount).toBeUndefined();
    expect(f.metadata.warnings).toBeUndefined();
  });
});

describe('metadata pipeline — resilience', () => {
  test('corrupt JPEG does not stop the scan', () => {
    // If scanDirectory resolved, the scan completed despite the corrupt file
    expect(results.totalFiles).toBe(4);
  });

  test('corrupt JPEG metadata contains warnings', () => {
    const f = results.files.find(f => path.basename(f.path) === 'corrupt.jpg');
    expect(f.metadata.warnings).toBeDefined();
    expect(f.metadata.warnings.length).toBeGreaterThan(0);
  });

  test('existing byExtension and quality fields are untouched', () => {
    expect(results.byExtension).toBeDefined();
    expect(results.quality).toBeDefined();
  });
});
