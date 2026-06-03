const path = require('path');
const { pathToFileURL } = require('url');

let _fqr = null;

async function _load() {
  if (_fqr) return _fqr;
  const fqrBase = path.resolve(__dirname, '../../../file-quality-report/src');
  const toUrl = (p) => pathToFileURL(p).href;
  const [{ walkDirectory }, { runAllAnalyzers }, { formatReport }] = await Promise.all([
    import(toUrl(path.join(fqrBase, 'walker.js'))),
    import(toUrl(path.join(fqrBase, 'analyzer/index.js'))),
    import(toUrl(path.join(fqrBase, 'reporter/formatter.js'))),
  ]);
  _fqr = { walkDirectory, runAllAnalyzers, formatReport };
  return _fqr;
}

async function analyzeQuality(dirPath) {
  const { walkDirectory, runAllAnalyzers, formatReport } = await _load();
  const files = walkDirectory(dirPath);
  const results = runAllAnalyzers(files);
  return formatReport(results);
}

module.exports = { analyzeQuality };
