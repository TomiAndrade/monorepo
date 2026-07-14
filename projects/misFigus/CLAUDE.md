@AGENTS.md

# misFigus — App rastreador de figuritas Mundial 2026

App Expo (React Native) para llevar el registro de la colección Panini WC2026. Sin backend, sin login, todo local con AsyncStorage.

## Stack
- Expo SDK 56 + Expo Router (tabs)
- AsyncStorage para persistencia local
- expo-haptics para feedback táctil
- React Native SectionList para la grilla por sección

## Estructura (ver "Estructura extendida" más abajo para detalle completo)

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

## Estructura extendida
```
app/
  _layout.tsx              ← SafeAreaProvider + ColeccionProvider + Slot (root)
  (tabs)/
    _layout.tsx            ← Tab bar (negro, acento verde)
    index.tsx              ← Pantalla Colección (completa)
    carga.tsx              ← Pantalla Carga rápida (completa)
src/
  data.ts                  ← Carga JSONs, construye SECTIONS, STICKER_MAP, FLAGS, etc.
  ColeccionContext.tsx      ← Context + Provider + useColeccion hook (AsyncStorage)
  useColeccion.ts          ← Re-export de ColeccionContext
  StickerCell.tsx          ← Celda con tres estados, haptics, long-press
  SubtractBar.tsx          ← Barra flotante para restar figuritas
  UndoToast.tsx            ← Toast con botón Deshacer (2.5s)
figuritas-wc2026.json      ← Catálogo 980 figuritas { code, name, team }
banderas.json              ← Mapeo team → emoji
```

## Estado actual — app completa ✅

### ✅ Paso 1 — Scaffold
- Expo + Expo Router instalado y funcionando (web + Expo Go)

### ✅ Paso 2 — SectionList con datos
- `src/data.ts` construye SECTIONS, STICKER_MAP, FLAGS desde los JSON

### ✅ Paso 3 — AsyncStorage
- `ColeccionContext.tsx`: Provider con `setSticker` y `adjustSticker` (updater funcional, seguro para taps rápidos)
- Lee al iniciar, persiste en cada cambio, maneja JSON corrupto con graceful fallback

### ✅ Paso 4 — Lógica tap / +/− / long-press
- **Tap**: +1 con haptic Light
- **Long-press (tengo × 1)**: reset a 0 con haptic Heavy
- **Long-press (repe)**: abre `SubtractBar` con haptic Medium
- `SubtractBar`: barra flotante en el fondo, botón −1 (mínimo 1), cierra con ✓ o scroll
- `UndoToast`: aparece 2.5s tras cada tap, sube cuando SubtractBar está visible
- Flag `longPressTriggered` en ref para evitar que onPress se dispare al soltar un long-press

### ✅ Paso 5 — Barra de progreso + filtros + búsqueda
- Header: título, `X / 980 figuritas`, porcentaje en verde, barra de progreso verde
- Filtros: Todas / Faltan / Repes (re-chunkea las filas al filtrar)
- Búsqueda por nombre de equipo (barra sticky en el tope)
- Header de sección se pone verde cuando la sección está completa

### ✅ Paso 6 — Pantalla Carga rápida
- Input con `autoFocus` y `autoCapitalize="characters"`
- Busca en STICKER_MAP, hace +1, muestra feedback verde/rojo por 2s
- Lista de últimas 20 figuritas cargadas con tag "tengo" / "×N repe"

### ✅ Paso 7 — Estética "stadium at night"
- Fondo: `#0a0a0a`
- Figurita falta: `#1a1a1a` borde `#2a2a2a`, código `#444`
- Figurita tengo: `#0d2d1a` borde `#4ade80`, código `#4ade80`
- Figurita repe: igual que tengo + badge ámbar `#f59e0b` con `×N`
- Barra de progreso: `#4ade80`
- Tab bar: negro con acento verde

## Posibles mejoras futuras
- Exportar / compartir lista de repes
- Modo "intercambio": marcar qué repes ofrecer y qué faltan buscar
- Animación de entrada al marcar una figurita

## Notas
- En Windows (web), los emojis de bandera no se ven como banderas — es esperado, no es un bug
- No hay CI configurado
- Rama de trabajo: `develop`
