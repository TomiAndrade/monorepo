const fs = require('fs/promises');
const { extract } = require('../../src/metadata/extractors/pdfExtractor');
const { generateFixtures } = require('../fixtures/generate');

let F;
beforeAll(async () => { F = await generateFixtures(); });

describe('pdfExtractor', () => {
  describe('valid PDF', () => {
    let result;
    beforeAll(async () => { result = await extract(F.validPdf); });

    test('extracts pageCount (5 pages in fixture)', () => {
      expect(result.data.pageCount).toBe(5);
    });

    test('produces no warnings', () => {
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('corrupt PDF', () => {
    let result;
    beforeAll(async () => { result = await extract(F.corruptPdf); });

    test('does not throw', () => {
      expect(result).toBeDefined();
    });

    test('adds at least one warning', () => {
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('warning mentions the failure', () => {
      expect(result.warnings[0]).toContain('failed');
    });
  });

  describe('file without read permissions (EACCES)', () => {
    let result;

    beforeAll(async () => {
      const spy = jest.spyOn(fs, 'readFile').mockRejectedValueOnce(
        Object.assign(new Error('Permission denied'), { code: 'EACCES' })
      );
      result = await extract('/restricted/file.pdf');
      spy.mockRestore();
    });

    test('does not throw', () => {
      expect(result).toBeDefined();
    });

    test('adds a warning', () => {
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('warning mentions the failure', () => {
      expect(result.warnings[0]).toContain('failed');
    });
  });
});
