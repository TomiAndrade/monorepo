// Cliente para hablar con API-Football.
// Toda la lógica de la API key y el caché vive acá, del lado del servidor.

const BASE_URL = `https://${process.env.API_FOOTBALL_HOST}`;

// Caché simple en memoria: { clave -> { data, expira } }
// Evita pegarle a la API en cada request y quemar la cuota gratuita.
const cache = new Map();
const CACHE_MS = 5 * 60 * 1000; // 5 minutos

function getCached(key) {
  const hit = cache.get(key);
  if (hit && hit.expira > Date.now()) {
    return hit.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key, data) {
  cache.set(key, { data, expira: Date.now() + CACHE_MS });
}

/**
 * Pega un endpoint de API-Football y devuelve el array `response`.
 * @param {string} path  ej. "/fixtures"
 * @param {object} params  ej. { league: 1, season: 2026 }
 */
export async function apiFootball(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ""}`;

  const cached = getCached(url);
  if (cached) return cached;

  const res = await fetch(url, {
    headers: {
      // Modo directo (api-sports.io). Si usás RapidAPI, cambiá por:
      //   "x-rapidapi-key": process.env.API_FOOTBALL_KEY,
      //   "x-rapidapi-host": process.env.API_FOOTBALL_HOST,
      "x-apisports-key": process.env.API_FOOTBALL_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`API-Football respondió ${res.status}`);
  }

  const json = await res.json();

  // API-Football devuelve errores dentro del body con status 200.
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API-Football error: ${JSON.stringify(json.errors)}`);
  }

  const data = json.response ?? [];
  setCached(url, data);
  return data;
}
