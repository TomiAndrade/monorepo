import { useState } from 'react';
import axios from 'axios';

function parseExtensions(raw) {
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0)
    .map((e) => (e.startsWith('.') ? e : `.${e}`));
}

function ScannerForm({ onResults }) {
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const [maxFileSize, setMaxFileSize] = useState(10);
  const [maxFileSizeUnit, setMaxFileSizeUnit] = useState('MB');
  const [errorExtensionsRaw, setErrorExtensionsRaw] = useState('');
  const [allowedExtensionsRaw, setAllowedExtensionsRaw] = useState('');

  const UNIT_TO_MB = { KB: 1 / 1024, MB: 1, GB: 1024, TB: 1024 * 1024 };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!path.trim()) return;

    setLoading(true);
    setError(null);

    const body = { path: path.trim(), maxFileSizeMB: Number(maxFileSize) * UNIT_TO_MB[maxFileSizeUnit] };

    const errorExtensions = parseExtensions(errorExtensionsRaw);
    if (errorExtensions.length > 0) body.errorExtensions = errorExtensions;

    const allowedExtensions = parseExtensions(allowedExtensionsRaw);
    if (allowedExtensions.length > 0) body.allowedExtensions = allowedExtensions;

    try {
      const response = await axios.post('http://localhost:3001/api/scan', body);
      onResults(response.data);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error inesperado';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="scanner-form">
      <form onSubmit={handleSubmit}>
        <div className="scanner-form__row">
          <input
            className="scanner-form__input"
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="Ingresá la ruta a escanear, ej: C:\Users\tomas\Documents"
            disabled={loading}
          />
          <button
            className="scanner-form__button"
            type="submit"
            disabled={loading || !path.trim()}
          >
            {loading ? 'Escaneando...' : 'Escanear'}
          </button>
        </div>

        <button
          type="button"
          className="scanner-form__options-toggle"
          onClick={() => setShowOptions((v) => !v)}
        >
          {showOptions ? '▲ Ocultar opciones' : '▼ Opciones de análisis'}
        </button>

        {showOptions && (
          <div className="scanner-form__options">
            <div className="scanner-form__option-group">
              <label className="scanner-form__label">
                Tamaño máximo de archivo a analizar (MB)
              </label>
              <div className="scanner-form__size-row">
                <input
                  className="scanner-form__input scanner-form__input--small"
                  type="number"
                  min="1"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  disabled={loading}
                />
                <select
                  className="scanner-form__select"
                  value={maxFileSizeUnit}
                  onChange={(e) => setMaxFileSizeUnit(e.target.value)}
                  disabled={loading}
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
              </div>
              <span className="scanner-form__hint">
                Archivos más grandes se omiten en la detección de duplicados y se marcan como error.
              </span>
            </div>

            <div className="scanner-form__option-group">
              <label className="scanner-form__label">
                Extensiones que deben dar error
              </label>
              <input
                className="scanner-form__input"
                type="text"
                value={errorExtensionsRaw}
                onChange={(e) => setErrorExtensionsRaw(e.target.value)}
                placeholder=".exe, .bat, .tmp"
                disabled={loading}
              />
              <span className="scanner-form__hint">
                Separadas por coma. Si están presentes en el directorio, se reportan como error.
              </span>
            </div>

            <div className="scanner-form__option-group">
              <label className="scanner-form__label">
                Extensiones permitidas (sin alerta)
              </label>
              <input
                className="scanner-form__input"
                type="text"
                value={allowedExtensionsRaw}
                onChange={(e) => setAllowedExtensionsRaw(e.target.value)}
                placeholder=".pdf, .docx, .xlsx, .jpg"
                disabled={loading}
              />
              <span className="scanner-form__hint">
                Extensiones esperadas en este directorio. Las demás generan advertencia.
                Los archivos vacíos siempre se reportan independientemente de la extensión.
              </span>
            </div>
          </div>
        )}
      </form>

      {loading && (
        <p className="scanner-form__spinner">⏳ Escaneando directorio, por favor esperá...</p>
      )}

      {error && (
        <p className="scanner-form__error">⚠️ {error}</p>
      )}
    </div>
  );
}

export default ScannerForm;
