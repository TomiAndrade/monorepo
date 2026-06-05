import { useState } from 'react';

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

function SpecificMeta({ m }) {
  const parts = [];
  if (m.width && m.height) parts.push(`${m.width}×${m.height}px`);
  if (m.durationSeconds != null) parts.push(`${m.durationSeconds}s`);
  if (m.pageCount != null) parts.push(`${m.pageCount} pág.`);
  if (m.exif) parts.push('EXIF');
  return parts.length > 0
    ? <span>{parts.join(' · ')}</span>
    : <span className="metadata-table__empty">—</span>;
}

function MetadataPanel({ files }) {
  const [open, setOpen] = useState(false);

  if (!files || files.length === 0) return null;

  const warnCount = files.filter(f => f.metadata.warnings?.length > 0).length;

  function toggle() { setOpen(o => !o); }
  function onKey(e) { if (e.key === 'Enter' || e.key === ' ') toggle(); }

  return (
    <div className="metadata-panel">
      <div
        className="metadata-panel__header"
        onClick={toggle}
        onKeyDown={onKey}
        role="button"
        tabIndex={0}
        aria-expanded={open}
      >
        <span className="metadata-panel__title">
          Metadata de archivos
          {!open && warnCount > 0 && (
            <span className="metadata-panel__badge--warn" title={`${warnCount} archivo${warnCount > 1 ? 's' : ''} con advertencias`}>
              ⚠ {warnCount}
            </span>
          )}
        </span>
        <span className="metadata-panel__toggle">{open ? '▲ Ocultar' : '▼ Ver metadata'}</span>
      </div>

      {open && (
        <div className="metadata-panel__body">
          <table className="metadata-table">
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Tipo</th>
                <th>Tamaño</th>
                <th>Modificado</th>
                <th>Info técnica</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, i) => {
                const m = file.metadata;
                const warns = m.warnings;
                return (
                  <tr key={i}>
                    <td className="metadata-table__name" title={file.path}>{m.fileName}</td>
                    <td><span className="metadata-table__ext">{m.extension}</span></td>
                    <td className="metadata-table__mono">{formatSize(m.sizeBytes)}</td>
                    <td className="metadata-table__mono">{formatDate(m.modifiedAt)}</td>
                    <td><SpecificMeta m={m} /></td>
                    <td>
                      {warns?.length > 0 ? (
                        <span className="metadata-table__warn" title={warns.join('\n')}>⚠ {warns.length}</span>
                      ) : (
                        <span className="metadata-table__ok">✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MetadataPanel;
