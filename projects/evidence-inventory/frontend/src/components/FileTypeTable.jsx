function FileTypeTable({ byExtension }) {
  const rows = Object.entries(byExtension)
    .map(([ext, info]) => ({
      extension: ext,
      count: info.count,
      totalSizeMB: info.totalSizeMB,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="table-card">
      <p className="table-card__title">Detalle por tipo de archivo</p>
      <table className="file-type-table">
        <thead>
          <tr>
            <th>Extensión</th>
            <th>Cantidad</th>
            <th>Tamaño (MB)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.extension}>
              <td>{row.extension}</td>
              <td>{row.count}</td>
              <td>{row.totalSizeMB}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FileTypeTable;
