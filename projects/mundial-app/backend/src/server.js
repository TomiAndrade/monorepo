import "dotenv/config";
import express from "express";
import cors from "cors";
import { apiFootball } from "./apiFootball.js";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// La competición "World Cup" en API-Football tiene id 1.
const WORLD_CUP_LEAGUE = 1;
const SEASON = 2026;

// Helper para no repetir el try/catch en cada ruta.
function ruta(handler) {
  return async (req, res) => {
    try {
      const data = await handler(req);
      res.json({ ok: true, data });
    } catch (err) {
      console.error(err);
      res.status(502).json({ ok: false, error: err.message });
    }
  };
}

// Chequeo rápido de que el server está vivo.
app.get("/api/health", (req, res) => {
  res.json({ ok: true, msg: "backend del Mundial funcionando" });
});

// Partidos del Mundial. Acepta ?live=true para solo los que están en juego,
// o ?date=YYYY-MM-DD para un día puntual.
app.get(
  "/api/matches",
  ruta(async (req) => {
    const params = { league: WORLD_CUP_LEAGUE, season: SEASON };
    if (req.query.live === "true") params.live = "all";
    if (req.query.date) params.date = req.query.date;
    return apiFootball("/fixtures", params);
  })
);

// Tabla de grupos del Mundial.
app.get(
  "/api/standings",
  ruta(async () => {
    return apiFootball("/standings", {
      league: WORLD_CUP_LEAGUE,
      season: SEASON,
    });
  })
);

// Detalle de un partido puntual: ?id=12345
app.get(
  "/api/matches/:id",
  ruta(async (req) => {
    return apiFootball("/fixtures", { id: req.params.id });
  })
);

app.listen(PORT, () => {
  console.log(`Backend del Mundial escuchando en http://localhost:${PORT}`);
});
