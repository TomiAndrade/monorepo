import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLS_COUNT, SECTIONS, STICKER_MAP, TOTAL, type Sticker, type StickerSection } from '../../src/data';
import { StickerCell } from '../../src/StickerCell';
import { SubtractBar } from '../../src/SubtractBar';
import { UndoToast, type UndoAction } from '../../src/UndoToast';
import { useColeccion } from '../../src/useColeccion';
import { makeUseThemedStyles, useTheme } from '../../src/ThemeContext';

type Filter = 'todas' | 'faltan' | 'repes';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'faltan', label: 'Faltan' },
  { key: 'repes', label: 'Repes' },
];

// Total real de cada sección, pre-calculado, no depende del filtro activo
const SECTION_STICKERS = new Map(SECTIONS.map((s) => [s.title, s.data.flat()]));

// Altura aprox. del SubtractBar + margen
const SUBTRACT_BAR_H = 76;

export default function ColeccionScreen() {
  const styles = useStyles();
  const { mode, colors, toggle } = useTheme();
  const { coleccion, loaded, adjustSticker, setSticker } = useColeccion();
  const [filter, setFilter] = useState<Filter>('todas');
  const [search, setSearch] = useState('');
  const [subtractCode, setSubtractCode] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState<UndoAction | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); };
  }, []);

  const owned = Object.values(coleccion).filter((v) => v >= 1).length;
  const progress = TOTAL > 0 ? owned / TOTAL : 0;
  const pct = Math.round(progress * 100);

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SECTIONS
      .filter((s) => !q || s.title.toLowerCase().includes(q))
      .map((section) => {
        if (filter === 'todas') return section;
        const flat = section.data.flat().filter((s) => {
          const v = coleccion[s.code] ?? 0;
          return filter === 'faltan' ? v === 0 : v >= 2;
        });
        if (flat.length === 0) return null;
        const chunks: Sticker[][] = [];
        for (let i = 0; i < flat.length; i += COLS_COUNT) {
          chunks.push(flat.slice(i, i + COLS_COUNT));
        }
        return { ...section, data: chunks };
      })
      .filter((s): s is StickerSection => s !== null);
  }, [filter, coleccion, search]);

  function sectionCountLabel(section: StickerSection): string {
    const flat = SECTION_STICKERS.get(section.title) ?? section.data.flat();
    const o = flat.filter((s) => (coleccion[s.code] ?? 0) >= 1).length;
    return `${o} / ${flat.length}`;
  }

  function isSectionComplete(section: StickerSection): boolean {
    const flat = SECTION_STICKERS.get(section.title) ?? section.data.flat();
    return flat.length > 0 && flat.every((s) => (coleccion[s.code] ?? 0) >= 1);
  }

  function emptyMsg(): string {
    if (search.trim()) return 'Sin resultados';
    if (filter === 'faltan') return '¡Colección completa!';
    if (filter === 'repes') return 'No tenés repetidas todavía';
    return '';
  }

  // --- Handlers de celda ---

  function handleTap(code: string) {
    // Cierra el subtract si está abierto para otra celda
    if (subtractCode && subtractCode !== code) setSubtractCode(null);

    const prevValue = coleccion[code] ?? 0;
    const newValue = prevValue + 1;
    // adjustSticker usa updater funcional: seguro para taps rápidos
    adjustSticker(code, +1);
    scheduleUndo(code, prevValue, newValue);
  }

  function handleReset(code: string) {
    setSubtractCode(null);
    setSticker(code, 0);
    // long-press no genera toast de undo
  }

  function handleOpenSubtract(code: string) {
    setSubtractCode(code);
  }

  // --- Undo ---

  function scheduleUndo(code: string, prevValue: number, newValue: number) {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setLastTap({ code, prevValue, newValue });
    undoTimerRef.current = setTimeout(() => setLastTap(null), 2500);
  }

  function handleUndo() {
    if (!lastTap) return;
    setSticker(lastTap.code, lastTap.prevValue);
    setLastTap(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }

  // Posición del toast: sube cuando el SubtractBar está visible
  const toastBottom = insets.bottom + 8 + (subtractCode ? SUBTRACT_BAR_H : 0);

  return (
    <View style={styles.container}>
      {/* Cabecera fija: título, progreso, filtros y búsqueda quedan pegados al scrollear */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>misFigus WC2026</Text>
          <Pressable style={styles.themeToggle} onPress={toggle} hitSlop={8}>
            <Text style={styles.themeToggleIcon}>{mode === 'dark' ? '☀️' : '🌙'}</Text>
          </Pressable>
        </View>
        <View style={styles.headerSubRow}>
          <Text style={styles.headerSub}>
            {loaded ? owned : '—'} / {TOTAL} figuritas
          </Text>
          <Text style={styles.headerPct}>{loaded ? `${pct}%` : ''}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar equipo..."
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={styles.searchClear} hitSlop={8}>
              <Text style={styles.searchClearText}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      <SectionList
        sections={filteredSections}
        keyExtractor={(_row, rowIndex) => String(rowIndex)}
        stickySectionHeadersEnabled
        // Scroll cierra el subtract bar naturalmente
        onScrollBeginDrag={() => setSubtractCode(null)}
        renderSectionHeader={({ section }) => {
          const complete = isSectionComplete(section);
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {section.flag} {section.title}
              </Text>
              <Text style={[styles.sectionCount, complete && styles.sectionCountComplete]}>
                {loaded ? sectionCountLabel(section) : '—'}
              </Text>
            </View>
          );
        }}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((sticker: Sticker) => (
              <StickerCell
                key={sticker.code}
                sticker={sticker}
                value={coleccion[sticker.code] ?? 0}
                subtractActive={subtractCode === sticker.code}
                onTap={handleTap}
                onReset={handleReset}
                onOpenSubtract={handleOpenSubtract}
              />
            ))}
            {Array.from({ length: COLS_COUNT - row.length }).map((_, i) => (
              <View key={`pad-${i}`} style={styles.cellPad} />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyMsg()}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      <SubtractBar
        code={subtractCode}
        onClose={() => setSubtractCode(null)}
      />

      <UndoToast
        action={lastTap}
        bottomOffset={toastBottom}
        onUndo={handleUndo}
      />
    </View>
  );
}

const useStyles = makeUseThemedStyles((c) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },
    topBar: {
      backgroundColor: c.bg,
      paddingHorizontal: 16,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    searchInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 12,
      marginTop: 2,
    },
    searchInput: {
      flex: 1,
      height: 40,
      color: c.text,
      fontSize: 15,
    },
    searchClear: {
      padding: 4,
    },
    searchClearText: {
      color: c.textMuted,
      fontSize: 13,
    },
    listContent: {
      paddingBottom: 32,
      paddingTop: 4,
    },
    headerTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      color: c.text,
      fontSize: 22,
      fontWeight: 'bold',
    },
    themeToggle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeToggleIcon: {
      fontSize: 18,
    },
    headerSubRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginTop: 4,
    },
    headerSub: {
      color: c.textMuted,
      fontSize: 14,
    },
    headerPct: {
      color: c.primary,
      fontSize: 13,
      fontWeight: '600',
    },
    progressTrack: {
      height: 4,
      backgroundColor: c.surfaceAlt,
      borderRadius: 2,
      marginTop: 10,
      marginBottom: 14,
      overflow: 'hidden',
    },
    progressFill: {
      height: 4,
      backgroundColor: c.primary,
      borderRadius: 2,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 10,
    },
    filterBtn: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
    },
    filterBtnActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    filterText: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: '500',
    },
    filterTextActive: {
      color: c.onPrimary,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    sectionHeaderText: {
      color: c.text,
      fontSize: 15,
      fontWeight: '600',
    },
    sectionCount: {
      color: c.textMuted,
      fontSize: 13,
    },
    sectionCountComplete: {
      color: c.owned,
    },
    row: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: 8,
    },
    cellPad: {
      flex: 1,
      aspectRatio: 1,
    },
    emptyState: {
      paddingTop: 80,
      alignItems: 'center',
    },
    emptyStateText: {
      color: c.textMuted,
      fontSize: 16,
    },
  })
);
