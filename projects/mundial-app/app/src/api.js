// Única puerta de la app hacia los datos.
// La app SIEMPRE le pega a tu backend, nunca a API-Football directo.

import Constants from "expo-constants";

// En web/dev usa localhost. Cuando pruebes en el celular con Expo Go,
// localhost apunta al teléfono, no a tu PC: ahí tenés que cambiar esto
// por la IP de tu compu en la red (ej. "http://192.168.0.10:3001").
const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ?? "http://localhost:3001";

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.error ?? "Error desconocido del backend");
  }
  return json.data;
}

// Partidos del Mundial. Opcionalmente solo los que están en vivo.
export function getMatches({ live = false } = {}) {
  return get(`/api/matches${live ? "?live=true" : ""}`);
}

// Tabla de grupos.
export function getStandings() {
  return get("/api/standings");
}
