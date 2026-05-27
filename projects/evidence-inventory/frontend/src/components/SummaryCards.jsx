function SummaryCards({ results }) {
  const totalMB = (results.totalSizeBytes / (1024 * 1024)).toFixed(2);
  const extensionCount = Object.keys(results.byExtension).length;
  const emptyFolderCount = results.emptyFolders.length;

  const cards = [
    { value: results.totalFiles, label: 'Total de archivos' },
    { value: `${totalMB} MB`, label: 'Tamaño total' },
    { value: extensionCount, label: 'Tipos de archivo' },
    { value: emptyFolderCount, label: 'Carpetas vacías' },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card) => (
        <div className="summary-card" key={card.label}>
          <div className="summary-card__value">{card.value}</div>
          <div className="summary-card__label">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
