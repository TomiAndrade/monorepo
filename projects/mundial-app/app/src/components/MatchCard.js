import { View, Text, Image, StyleSheet } from "react-native";
import { colors, space, radius, font } from "../theme";

// Devuelve cómo mostrar el estado del partido según los datos de API-Football.
// El estado es información real: dice si mirar ahora, cuándo, o si ya terminó.
function estadoPartido(fixture) {
  const short = fixture.status.short;
  const enVivo = ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(short);
  if (enVivo) {
    return { live: true, texto: `${fixture.status.elapsed}'` };
  }
  if (short === "FT" || short === "AET" || short === "PEN") {
    return { live: false, texto: "Final" };
  }
  // No empezó: mostramos la hora local.
  const hora = new Date(fixture.date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { live: false, texto: hora };
}

function Equipo({ team, goals, alineadoDerecha }) {
  return (
    <View style={[styles.equipo, alineadoDerecha && styles.equipoDerecha]}>
      {team.logo ? (
        <Image source={{ uri: team.logo }} style={styles.escudo} />
      ) : (
        <View style={styles.escudo} />
      )}
      <Text style={styles.nombreEquipo} numberOfLines={1}>
        {team.name}
      </Text>
    </View>
  );
}

export default function MatchCard({ item }) {
  const { fixture, teams, goals } = item;
  const estado = estadoPartido(fixture);

  return (
    <View style={styles.card}>
      <View style={styles.fila}>
        <Equipo team={teams.home} goals={goals.home} />

        <View style={styles.centro}>
          <Text style={styles.marcador}>
            {goals.home ?? 0} <Text style={styles.guion}>–</Text>{" "}
            {goals.away ?? 0}
          </Text>
          <View
            style={[styles.estado, estado.live && styles.estadoLive]}
          >
            <Text
              style={[
                styles.estadoTexto,
                estado.live && styles.estadoTextoLive,
              ]}
            >
              {estado.live ? "● " : ""}
              {estado.texto}
            </Text>
          </View>
        </View>

        <Equipo team={teams.away} goals={goals.away} alineadoDerecha />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
  },
  equipo: {
    flex: 1,
    alignItems: "center",
    gap: space.xs,
  },
  equipoDerecha: {},
  escudo: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  nombreEquipo: {
    ...font.body,
    fontSize: 13,
    textAlign: "center",
  },
  centro: {
    alignItems: "center",
    paddingHorizontal: space.md,
    gap: space.xs,
  },
  marcador: {
    ...font.display,
    fontSize: 26,
    fontVariant: ["tabular-nums"],
  },
  guion: {
    color: colors.textDim,
  },
  estado: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  estadoLive: {
    backgroundColor: "rgba(255,77,77,0.15)",
  },
  estadoTexto: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textDim,
    fontVariant: ["tabular-nums"],
  },
  estadoTextoLive: {
    color: colors.live,
  },
});
