# Mundial App

App de datos del Mundial 2026 (FIFA World Cup). Funciona como página web y como app móvil (iOS/Android) desde una sola base de código.

Esta es la **v1**: solo Mundial. Más adelante se le suman F1, fútbol de clubes, etc.

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

## ¿Por qué un backend en el medio?

Si la app móvil/web le pegara directo a API-Football, tu API key viajaría
en el código del cliente y cualquiera podría robarla (y gastarte tu cuota).
El backend guarda la clave en una variable de entorno del servidor y solo
expone los endpoints que vos quieras.

## Cómo arrancar

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

## Notas

- El backend cachea las respuestas en memoria por unos minutos para no quemar
  tu cuota gratuita de requests mientras desarrollás.
- El ID de la competición "World Cup" en API-Football es `1`. La temporada
  se pasa como año (ej. `2026`).
