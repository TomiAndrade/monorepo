import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMatches } from "../src/api";
import MatchCard from "../src/components/MatchCard";
import { colors, space, font, radius } from "../src/theme";

export default function Home() {
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [soloVivo, setSoloVivo] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const data = await getMatches({ live: soloVivo });
      // Ordenar por horario de inicio.
      data.sort(
        (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
      );
      setMatches(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [soloVivo]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const onRefresh = () => {
    setRefreshing(true);
    cargar();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + space.md }]}>
      <View style={styles.header}>
        <Text style={font.label}>FIFA World Cup 2026</Text>
        <Text style={styles.titulo}>Partidos</Text>
      </View>

      <View style={styles.filtros}>
        <Filtro
          activo={!soloVivo}
          onPress={() => setSoloVivo(false)}
          texto="Todos"
        />
        <Filtro
          activo={soloVivo}
          onPress={() => setSoloVivo(true)}
          texto="En vivo"
        />
      </View>

      {loading ? (
        <View style={styles.centrado}>
          <ActivityIndicator color={colors.pitchBright} />
        </View>
      ) : error ? (
        <View style={styles.centrado}>
          <Text style={styles.errorTitulo}>No se pudieron cargar los partidos</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <Text style={styles.errorPista}>
            ¿Está corriendo el backend en localhost:3001?
          </Text>
          <Pressable style={styles.reintentar} onPress={cargar}>
            <Text style={styles.reintentarTexto}>Reintentar</Text>
          </Pressable>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.vacio}>
            {soloVivo
              ? "No hay partidos en juego ahora mismo."
              : "No hay partidos para mostrar."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => String(item.fixture.id)}
          renderItem={({ item }) => <MatchCard item={item} />}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.pitchBright}
            />
          }
        />
      )}
    </View>
  );
}

function Filtro({ activo, onPress, texto }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filtro, activo && styles.filtroActivo]}
    >
      <Text style={[styles.filtroTexto, activo && styles.filtroTextoActivo]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: space.md,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    gap: space.xs,
    marginBottom: space.md,
  },
  titulo: {
    ...font.display,
    // Acento de marca: un subrayado amarillo bajo el título lo da el borde.
    borderBottomWidth: 3,
    borderBottomColor: colors.line,
    alignSelf: "flex-start",
    paddingBottom: 2,
  },
  filtros: {
    flexDirection: "row",
    gap: space.sm,
    marginBottom: space.md,
  },
  filtro: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  filtroActivo: {
    backgroundColor: colors.pitch,
    borderColor: colors.pitchBright,
  },
  filtroTexto: {
    ...font.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
  },
  filtroTextoActivo: {
    color: colors.text,
  },
  lista: {
    paddingBottom: space.xl,
  },
  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    padding: space.lg,
  },
  vacio: {
    ...font.body,
    color: colors.textDim,
    textAlign: "center",
  },
  errorTitulo: { ...font.h2, textAlign: "center" },
  errorMsg: { ...font.body, color: colors.textDim, textAlign: "center" },
  errorPista: {
    ...font.body,
    fontSize: 13,
    color: colors.textDim,
    textAlign: "center",
  },
  reintentar: {
    marginTop: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.pitch,
  },
  reintentarTexto: { ...font.body, fontWeight: "700" },
});
