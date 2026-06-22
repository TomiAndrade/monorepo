@AGENTS.md

# misFigus — App rastreador de figuritas Mundial 2026

App Expo (React Native) para llevar el registro de la colección Panini WC2026. Sin backend, sin login, todo local con AsyncStorage.

## Stack
- Expo SDK 56 + Expo Router (tabs)
- AsyncStorage para persistencia local
- expo-haptics para feedback táctil
- React Native SectionList para la grilla por sección

## Estructura
```
app/
  _layout.tsx          ← SafeAreaProvider + Slot (root)
  (tabs)/
    _layout.tsx        ← Tab bar (negro, acento verde)
    index.tsx          ← Pantalla Colección
    carga.tsx          ← Pantalla Carga rápida (placeholder)
src/
  data.ts              ← Carga JSONs, construye SECTIONS, STICKER_MAP, etc.
figuritas-wc2026.json  ← Catálogo 980 figuritas { code, name, team }
banderas.json          ← Mapeo team → emoji
```

## Datos clave (src/data.ts)
- `SECTIONS`: array de `{ title, flag, data: Sticker[][] }` — las filas ya están chunkeadas en grupos de 5 para la grilla
- `ALL_STICKERS`: array plano de las 980 figuritas
- `STICKER_MAP`: Map<code, Sticker> para lookup rápido
- `TOTAL`: 980
- `COLS_COUNT`: 5

## Colección del usuario (AsyncStorage)
- Clave: `"coleccion-wc2026"`
- Formato: `{ [code: string]: number }` — solo los que el usuario tocó
- `0` o ausente = falta | `1` = la tengo | `2+` = tengo + repes (repes = cantidad - 1)

## Estado actual — completado hasta Paso 2 de 8

### ✅ Paso 1 — Scaffold
- Expo + Expo Router instalado y funcionando (web + Expo Go)
- Dependencias: expo-router, async-storage, expo-haptics, react-native-web, react-dom, expo-linking, expo-constants, expo-font, expo-splash-screen, @expo/metro-runtime, babel-preset-expo

### ✅ Paso 2 — SectionList con datos crudos
- `src/data.ts` construye las secciones desde los JSON
- `app/(tabs)/index.tsx` muestra SectionList con sticky headers (emoji + nombre + "0/Y") y grilla de cuadraditos oscuros con el código

### ⏳ Paso 3 — AsyncStorage (PRÓXIMO)
- Leer colección al iniciar, cargar en estado (en memoria)
- Escribir automáticamente en cada cambio
- Clave: `"coleccion-wc2026"`

### Pasos pendientes
4. Lógica tap / +/− / long-press + tres estados visuales (falta/tengo/repe)
5. Barra de progreso global + filtro Todas/Faltan/Repes
6. Pantalla Carga rápida (input → +1 al código)
7. Pulido visual: tema "stadium at night" completo

## Estética objetivo: "stadium at night"
- Fondo: `#0a0a0a`
- Figurita falta: gris opaco (`#1a1a1a`, texto `#444`)
- Figurita tengo: iluminada con acento verde (`#4ade80`)
- Figurita repe: iluminada + badge ámbar con "×N"
- Barra de progreso: verde de cancha
- Tab bar: negro con acento verde

## Notas
- En Windows (web), los emojis de bandera no se ven como banderas — es esperado, no es un bug
- No hay CI configurado
- Rama de trabajo: `develop`
