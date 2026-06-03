function parseItem(item) {
  const sep = item.indexOf(': ');
  if (sep === -1) return { file: item, message: '' };
  const fullPath = item.slice(0, sep);
  const message = item.slice(sep + 2);
  const filename = fullPath.replace(/\\/g, '/').split('/').pop();
  return { file: filename, fullPath, message };
}

function QualityReport({ quality }) {
  if (!quality) return null;

  const { summary, sections, suggestedActions } = quality;
  const hasIssues = summary.total > 0;
  const hasActions =
    suggestedActions.length > 0 &&
    suggestedActions[0] !== 'No se detectaron problemas que requieran acción';

  return (
    <div className="quality-report">
      <h2 className="quality-report__title">Calidad de archivos</h2>

      <div className="quality-report__summary">
        <span className="quality-badge quality-badge--error">{summary.errors} errores</span>
        <span className="quality-badge quality-badge--warning">{summary.warnings} advertencias</span>
        <span className="quality-badge quality-badge--info">{summary.infos} informativos</span>
      </div>

      {!hasIssues && (
        <p className="quality-report__clean">Sin problemas detectados.</p>
      )}

      {sections.map((section) => (
        <div key={section.severity} className={`quality-section quality-section--${section.severity}`}>
          <h3 className="quality-section__title">{section.title}</h3>
          <ul className="quality-section__list">
            {section.items.map((item, i) => {
              const { file, message } = parseItem(item);
              return (
                <li key={i} className="quality-section__item">
                  <span className="quality-section__file">{file}</span>
                  {message && <span className="quality-section__message">{message}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {hasActions && (
        <div className="quality-report__actions">
          <h3 className="quality-report__actions-title">Acciones sugeridas</h3>
          <ul className="quality-report__actions-list">
            {suggestedActions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default QualityReport;
