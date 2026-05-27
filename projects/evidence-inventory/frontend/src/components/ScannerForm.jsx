import { useState } from 'react';
import axios from 'axios';

function ScannerForm({ onResults }) {
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!path.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3001/api/scan', { path: path.trim() });
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
