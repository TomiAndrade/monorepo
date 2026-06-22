# Mundial App — Claude Context

App de datos deportivos (web + móvil desde una sola base de código). v1 = solo
Mundial 2026; pensada como app de deportes más amplia (F1, fútbol de clubes a
futuro). **El README es la fuente de verdad del estado del proyecto** — leelo
antes de trabajar. Este archivo son las reglas para trabajar en el repo.

## Stack y estructura

- **backend/** — Express (Node, `type: module`). Proxy a API-Football que oculta
  la API key + caché en memoria de 5 min. Entrypoint: `src/server.js`; cliente
  HTTP en `src/apiFootball.js`.
- **app/** — Expo (React Native) + expo-router 4, SDK 52. Pantalla principal en
  `app/index.js`; capa de datos en `src/api.js`; tokens de diseño en
  `src/theme.js`; componentes en `src/components/`.

## Reglas de arquitectura

- **La app NUNCA le pega directo a API-Football.** Siempre vía el backend, que
  es el único que conoce la API key. No metas la key ni URLs de API-Football en
  `app/`.
- **No sobre-acoplar a fútbol.** Hoy hay un único cliente (`apiFootball.js`).
  Cuando entre F1 (ver Roadmap del README) conviene un cliente aparte y
  endpoints por deporte (`/api/football/...`, `/api/f1/...`). Para la v1 no hace
  falta tocar nada, pero tenelo en mente al diseñar.
- Respuestas del backend con formato `{ ok, data? , error?, msg? }`. Las rutas
  usan el helper `ruta()` en `server.js` para el try/catch.

## Convenciones

- **Código y comentarios en castellano.**
- Paleta "estadio de noche" definida en `app/src/theme.js` (verde césped
  `#0B6E4F`, fondo `#0A0F0D`, acento amarillo `#E8E34A`). Usar los tokens de
  `theme.js` (`colors`, `space`, `radius`, `font`), no valores hardcodeados.
- Constantes clave en `backend/src/server.js`: `WORLD_CUP_LEAGUE = 1`
  (**sin confirmar**, ver README) y `SEASON = 2026`.

## Commits

Convención del monorepo, scope = `mundial-app`:

```
feat(mundial-app): descripción
fix(mundial-app): descripción
docs(mundial-app): descripción
chore(mundial-app): descripción
```

Se trabaja en `develop` y se sube a `origin/develop`. Mergear a `main` solo
cuando el bloque está estable.

## Verificación de cambios

- **Backend:** verificar con llamadas directas (curl / Invoke-RestMethod). Sin
  API key válida los endpoints de datos devuelven `403` — es esperado; el
  `/api/health` igual responde.
- **Frontend / UI:** **no** correr el dev server ni tomar screenshots. La
  verificación visual la hace el usuario. Que el código compile sin errores
  alcanza para reportar un cambio de UI como listo.

## Setup en una PC nueva

`node_modules` y `.env` no están en el repo. Hay que `npm install` en `backend/`
y `app/`, y copiar `backend/.env.example` → `backend/.env` con la API key. Si las
versiones de Expo chocan: `npx expo install --fix`. Detalle en el README.
