// Sistema de diseño de la app.
// Paleta: estadio de noche — verde césped profundo, fondo casi negro,
// y un amarillo "líneas de cancha" como acento único.

export const colors = {
  bg: "#0A0F0D", // negro verdoso, fondo
  surface: "#12211B", // tarjetas
  surfaceAlt: "#1A2E25", // tarjetas alternas / bordes
  pitch: "#0B6E4F", // verde césped, color de marca
  pitchBright: "#15A66E", // verde brillante para acentos vivos
  line: "#E8E34A", // amarillo "línea de cancha", acento único
  live: "#FF4D4D", // rojo para partidos en vivo
  text: "#F2F5F3", // texto principal
  textDim: "#8FA39A", // texto secundario
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
};

export const font = {
  // System fonts por ahora (sin assets externos). El peso es lo que carga
  // la personalidad: títulos muy pesados, datos en tono apagado.
  display: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: colors.text,
  },
  h2: { fontSize: 18, fontWeight: "700", color: colors.text },
  body: { fontSize: 15, fontWeight: "500", color: colors.text },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textDim,
  },
};
