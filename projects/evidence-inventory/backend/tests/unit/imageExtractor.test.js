const { extract } = require('../../src/metadata/extractors/imageExtractor');
const { generateFixtures } = require('../fixtures/generate');

let F;
beforeAll(async () => { F = await generateFixtures(); });

describe('imageExtractor', () => {
  describe('valid JPEG (no EXIF)', () => {
    let result;
    beforeAll(async () => { result = await extract(F.validJpg); });

    test('extracts width and height', () => {
      expect(result.data.width).toBe(10);
      expect(result.data.height).toBe(10);
    });

    test('exif is not set when image has no EXIF data', () => {
      expect(result.data.exif).toBeUndefined();
    });

    test('produces no warnings', () => {
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('JPEG with EXIF', () => {
    let result;
    beforeAll(async () => { result = await extract(F.jpegWithExif); });

    test('extracts width and height', () => {
      expect(result.data.width).toBe(10);
      expect(result.data.height).toBe(10);
    });

    test('extracts EXIF data including Make', () => {
      expect(result.data.exif).toBeDefined();
      expect(result.data.exif.Make).toBe('TestCamera');
    });

    test('produces no warnings', () => {
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('valid PNG', () => {
    let result;
    beforeAll(async () => { result = await extract(F.validPng); });

    test('extracts width and height', () => {
      expect(result.data.width).toBe(10);
      expect(result.data.height).toBe(10);
    });

    test('produces no warnings', () => {
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('corrupt image', () => {
    let result;
    beforeAll(async () => { result = await extract(F.corruptJpg); });

    test('does not throw', () => {
      expect(result).toBeDefined();
    });

    test('adds at least one warning', () => {
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('warnings mention the failure', () => {
      expect(result.warnings.some(w => w.includes('failed'))).toBe(true);
    });
  });

  describe('non-existent / unreadable file', () => {
    let result;
    beforeAll(async () => { result = await extract('/nonexistent/path/image.jpg'); });

    test('does not throw', () => {
      expect(result).toBeDefined();
    });

    test('adds at least one warning', () => {
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
