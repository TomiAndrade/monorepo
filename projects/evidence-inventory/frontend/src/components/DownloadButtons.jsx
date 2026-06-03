function generateCSV(byExtension) {
  const rows = Object.entries(byExtension)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ext, data]) => `${ext};${data.count};${data.totalSizeBytes};${data.totalSizeMB}`);
  return ['sep=;\nextension;fileCount;totalSizeBytes;totalSizeMB', ...rows].join('\n');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function DownloadButtons({ results }) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');

  const handleJSON = () => {
    downloadBlob(
      JSON.stringify(results, null, 2),
      `reporte-${timestamp}.json`,
      'application/json'
    );
  };

  const handleCSV = () => {
    downloadBlob(
      generateCSV(results.byExtension),
      `reporte-${timestamp}.csv`,
      'text/csv'
    );
  };

  return (
    <div className="download-buttons">
      <button className="download-btn" onClick={handleJSON}>⬇ Descargar JSON</button>
      <button className="download-btn" onClick={handleCSV}>⬇ Descargar CSV</button>
    </div>
  );
}

export default DownloadButtons;
