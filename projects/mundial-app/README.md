# Mundial App

App de datos del Mundial 2026 (FIFA World Cup). Funciona como página web y como
app móvil (iOS/Android) desde una sola base de código.

Esta es la **v1**: solo Mundial. Está pensada como una app de deportes más
amplia (ver [Roadmap](#roadmap)).

**Stack:** Expo (React Native) en el frontend, Express (Node) en el backend.
Código y comentarios en **castellano**.

---

## Estado del proyecto

> Última actualización: 2026-06-21

### Funciona ✅

- **Backend Express** levanta en `:3001`, con proxy a API-Football (oculta la
  API key) y caché en memoria de 5 min. Verificado: `/api/health` responde y
  `/api/matches` devuelve error controlado cuando la key no es válida.
- **App Expo** (expo-router) con **pantalla de partidos**: escudos, marcador,
  estado (en vivo con minuto / hora de inicio / "Final"), filtro Todos vs
  En vivo, pull-to-refresh, manejo de errores y estado vacío.
- Deps de Expo alineadas al **SDK 52** (`expo install --check` da OK).
- Tema visual "estadio de noche" definido en `app/src/theme.js`.

### Pendiente / a verificar ⏳

1. **API key real.** El `.env` arranca con un placeholder; sin una key válida
   de api-football.com, los endpoints de datos devuelven `403`. (Ver
   [Cómo arrancar](#cómo-arrancar).)
2. **ID de liga sin confirmar.** En `backend/src/server.js` está
   `WORLD_CUP_LEAGUE = 1` como valor tentativo. **No está confirmado.** Una vez
   que tengas la API key, verificalo con `/leagues?search=world cup`.
3. **Falta UI de tabla de grupos.** El endpoint `/api/standings` ya existe, pero
   no hay pantalla que lo consuma todavía.
4. **Falta pantalla de detalle de partido** (alineaciones / stats), que
   consumiría `/api/matches/:id`.
5. **IP para celular físico.** `apiBaseUrl` en `app/app.json` está en
   `localhost`, que sirve para web. Para probar en el teléfono con Expo Go hay
   que cambiarlo por la IP de la PC en la red local
   (ej. `http://192.168.0.10:3001`).

### Próximos pasos sugeridos

1. Pantalla de tabla de grupos (endpoint listo).
2. Pantalla de detalle de partido con alineaciones y estadísticas.

---

## Arquitectura

```
mundial-app/
├── backend/        # API propia (Node + Express) que oculta tu API key
│                   # y habla con API-Football. El celular/web NUNCA
│                   # ve tu clave: solo le pega a tu backend.
│
└── app/            # Frontend Expo (React Native). Corre en web, iOS y Android.
                    # Le pega a tu backend, no a API-Football directo.
```

Flujo de datos:

```
[ App Expo ]  ->  [ Tu backend Express ]  ->  [ API-Football ]
  web/móvil          oculta la API key         datos del Mundial
```

### Estructura de archivos

```
mundial-app/
├── README.md
├── backend/
│   ├── package.json               # type: module, scripts start/dev
│   ├── .env.example               # API_FOOTBALL_KEY, API_FOOTBALL_HOST, PORT
│   ├── .gitignore
│   └── src/
│       ├── apiFootball.js         # cliente HTTP + caché en memoria (5 min)
│       └── server.js              # endpoints Express
└── app/
    ├── package.json               # Expo SDK 52, expo-router 4
    ├── app.json                   # config; extra.apiBaseUrl = localhost:3001
    ├── babel.config.js
    ├── .gitignore
    ├── app/
    │   ├── _layout.js             # layout raíz (expo-router + SafeArea)
    │   └── index.js               # pantalla principal: lista de partidos
    └── src/
        ├── theme.js               # tokens de diseño (colores, espaciado, tipo)
        ├── api.js                 # capa que habla con el backend
        └── components/
            └── MatchCard.js       # tarjeta de partido
```

### ¿Por qué un backend en el medio?

Si la app móvil/web le pegara directo a API-Football, tu API key viajaría
en el código del cliente y cualquiera podría robarla (y gastarte tu cuota).
El backend guarda la clave en una variable de entorno del servidor y solo
expone los endpoints que vos quieras.

---

## Endpoints del backend

Todos responden con el formato `{ ok: boolean, data?, error?, msg? }`.

| Método y ruta             | Descripción                                              |
| ------------------------- | ------------------------------------------------------- |
| `GET /api/health`         | Chequeo de vida.                                        |
| `GET /api/matches`        | Partidos del Mundial. Acepta `?live=true` y `?date=YYYY-MM-DD`. |
| `GET /api/matches/:id`    | Detalle de un partido puntual (por id de fixture).      |
| `GET /api/standings`      | Tabla de grupos. (Backend listo, falta la UI.)          |

### Constantes clave (`backend/src/server.js`)

- `WORLD_CUP_LEAGUE = 1` — id de la liga. **Sin confirmar** (ver pendientes).
- `SEASON = 2026` — temporada, se pasa como año.

---

## Cómo arrancar

> Tras clonar en una PC nueva, `node_modules` y `.env` **no** vienen en el repo
> (están en `.gitignore`): hay que correr `npm install` y crear el `.env`.

### 1. Conseguir una API key (gratis)

1. Andá a https://www.api-football.com/ y registrate (plan free).
2. Copiá tu API key del dashboard.
3. El plan gratuito da ~100 requests/día, suficiente para desarrollar.

> API-Football se puede consumir de dos formas: directo (`v3.football.api-sports.io`)
> o vía RapidAPI. Este backend usa el modo directo. Si te registrás por RapidAPI,
> cambiá la URL base y el header (ver `backend/.env.example`).

### 2. Levantar el backend

```bash
cd backend
cp .env.example .env      # y pegá tu API key dentro de .env
npm install
npm run dev               # arranca en http://localhost:3001
```

Probá que ande: abrí http://localhost:3001/api/health en el navegador.

### 3. Levantar la app

```bash
cd app
npm install
npm run web               # abre la versión web
# o:
npm start                 # te da un QR para abrir en tu celular con Expo Go
```

> **Probando en celular físico:** `localhost` apunta al teléfono, no a tu PC.
> Cambiá `extra.apiBaseUrl` en `app/app.json` por la IP de tu compu en la red
> local (ej. `http://192.168.0.10:3001`).

> Si al instalar las versiones de Expo chocan, `npx expo install --fix` las
> alinea al SDK.

---

## Notas

- El backend cachea las respuestas en memoria por 5 min para no quemar tu cuota
  gratuita de requests mientras desarrollás.
- La temporada se pasa como año (ej. `2026`).

---

## Roadmap

La v1 es solo Mundial 2026, pero la app es una app de deportes más amplia. A
futuro tiene que incorporar:

- **F1 (Fórmula 1):** calendario de carreras, resultados, clasificación de
  pilotos y constructores, datos de cada Gran Premio. Segundo deporte
  prioritario después del fútbol.
- **Fútbol de clubes** (ligas, no solo selecciones).

**Implicancia para la arquitectura:** el backend no debería quedar atado solo a
fútbol. Hoy hay un único cliente (`apiFootball.js`); cuando entre F1 conviene un
cliente aparte (otra API, ej. Jolpica/Ergast u OpenF1) y endpoints por deporte
(`/api/football/...`, `/api/f1/...`). Tenerlo en mente para no sobre-acoplar
ahora, aunque para la v1 no hace falta tocar nada.
