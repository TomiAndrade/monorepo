import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FLAGS, STICKER_MAP } from '../../src/data';
import { useColeccion } from '../../src/useColeccion';
import { makeUseThemedStyles, useTheme } from '../../src/ThemeContext';

type Reciente = {
  id: string;
  code: string;
  name: string;
  flag: string;
  newValue: number;
};

type Feedback = { ok: boolean; msg: string };

export default function CargaScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { coleccion, setSticker } = useColeccion();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [recientes, setRecientes] = useState<Reciente[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function flash(fb: Feedback) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(fb);
    timerRef.current = setTimeout(() => setFeedback(null), 2000);
  }

  function handleSubmit() {
    const code = input.trim().toUpperCase();
    if (!code) return;

    const sticker = STICKER_MAP.get(code);
    if (!sticker) {
      flash({ ok: false, msg: `"${code}" no encontrado` });
      return;
    }

    const newValue = (coleccion[code] ?? 0) + 1;
    setSticker(code, newValue);
    setRecientes((prev) => [
      {
        id: `${code}-${Date.now()}`,
        code,
        name: sticker.name,
        flag: FLAGS[sticker.team] ?? '🏳️',
        newValue,
      },
      ...prev.slice(0, 19),
    ]);
    flash({ ok: true, msg: `${code} — ${sticker.name}` });
    setInput('');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Carga rápida</Text>
      <Text style={styles.subtitle}>Ingresá el código y presioná +1</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={(t) => setInput(t.toUpperCase())}
          onSubmitEditing={handleSubmit}
          placeholder="ARG1"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          autoFocus
        />
        <Pressable style={styles.addBtn} onPress={handleSubmit}>
          <Text style={styles.addBtnText}>+1</Text>
        </Pressable>
      </View>

      <View style={styles.feedbackContainer}>
        {feedback && (
          <View style={[styles.feedback, feedback.ok ? styles.feedbackOk : styles.feedbackErr]}>
            <Text style={[styles.feedbackText, feedback.ok ? styles.feedbackTextOk : styles.feedbackTextErr]}>
              {feedback.ok ? '✓' : '✗'} {feedback.msg}
            </Text>
          </View>
        )}
      </View>

      {recientes.length > 0 && (
        <>
          <Text style={styles.recentesTitle}>Recién cargadas</Text>
          <FlatList
            data={recientes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.recenteRow}>
                <Text style={styles.recenteCode}>{item.code}</Text>
                <Text style={styles.recenteName} numberOfLines={1}>
                  {item.flag} {item.name}
                </Text>
                <Text style={[styles.recenteTag, item.newValue >= 2 && styles.recenteTagRepe]}>
                  {item.newValue >= 2 ? `×${item.newValue - 1} repe` : 'tengo'}
                </Text>
              </View>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}
    </View>
  );
}

const useStyles = makeUseThemedStyles((c) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
      paddingHorizontal: 16,
    },
    title: {
      color: c.text,
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    subtitle: {
      color: c.textMuted,
      fontSize: 14,
      marginBottom: 20,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 8,
    },
    input: {
      flex: 1,
      height: 52,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 16,
      color: c.text,
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: 1,
    },
    addBtn: {
      width: 72,
      height: 52,
      backgroundColor: c.primary,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnText: {
      color: c.onPrimary,
      fontSize: 18,
      fontWeight: 'bold',
    },
    feedbackContainer: {
      height: 44,
      marginTop: 12,
      justifyContent: 'center',
    },
    feedback: {
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    feedbackOk: {
      backgroundColor: c.ownedBg,
      borderWidth: 1,
      borderColor: c.owned,
    },
    feedbackErr: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.danger,
    },
    feedbackText: {
      fontSize: 14,
      fontWeight: '500',
    },
    feedbackTextOk: {
      color: c.owned,
    },
    feedbackTextErr: {
      color: c.danger,
    },
    recentesTitle: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginTop: 24,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    recenteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      gap: 10,
    },
    recenteCode: {
      color: c.primary,
      fontSize: 13,
      fontWeight: '700',
      width: 52,
    },
    recenteName: {
      color: c.textMuted,
      fontSize: 13,
      flex: 1,
    },
    recenteTag: {
      color: c.owned,
      fontSize: 12,
      fontWeight: '500',
    },
    recenteTagRepe: {
      color: c.repe,
    },
  })
);
