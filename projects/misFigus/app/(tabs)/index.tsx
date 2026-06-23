import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLS_COUNT, SECTIONS, TOTAL, type Sticker, type StickerSection } from '../../src/data';
import { StickerCell } from '../../src/StickerCell';
import { useColeccion } from '../../src/useColeccion';

type Filter = 'todas' | 'faltan' | 'repes';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'faltan', label: 'Faltan' },
  { key: 'repes', label: 'Repes' },
];

export default function ColeccionScreen() {
  const { coleccion, loaded, setSticker } = useColeccion();
  const [filter, setFilter] = useState<Filter>('todas');
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

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

  function sectionCountLabel(sectionData: Sticker[][]): string {
    const flat = sectionData.flat();
    if (filter === 'todas') {
      const o = flat.filter((s) => (coleccion[s.code] ?? 0) >= 1).length;
      return `${o} / ${flat.length}`;
    }
    return String(flat.length);
  }

  function isSectionComplete(sectionData: Sticker[][]): boolean {
    if (filter !== 'todas') return false;
    const flat = sectionData.flat();
    return flat.length > 0 && flat.every((s) => (coleccion[s.code] ?? 0) >= 1);
  }

  function emptyMsg(): string {
    if (search.trim()) return 'Sin resultados';
    if (filter === 'faltan') return '¡Colección completa!';
    if (filter === 'repes') return 'No tenés repetidas todavía';
    return '';
  }

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda fija — siempre visible */}
      <View style={[styles.searchBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar equipo..."
            placeholderTextColor="#333"
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
        renderSectionHeader={({ section }) => {
          const complete = isSectionComplete(section.data);
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {section.flag} {section.title}
              </Text>
              <Text style={[styles.sectionCount, complete && styles.sectionCountComplete]}>
                {loaded ? sectionCountLabel(section.data) : '—'}
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
                onChange={setSticker}
              />
            ))}
            {Array.from({ length: COLS_COUNT - row.length }).map((_, i) => (
              <View key={`pad-${i}`} style={styles.cellPad} />
            ))}
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>misFigus WC2026</Text>
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
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyMsg()}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  searchBar: {
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 15,
  },
  searchClear: {
    padding: 4,
  },
  searchClearText: {
    color: '#555',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  headerSub: {
    color: '#888',
    fontSize: 14,
  },
  headerPct: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#1f1f1f',
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#4ade80',
    borderRadius: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterBtnActive: {
    backgroundColor: '#0d2d1a',
    borderColor: '#4ade80',
  },
  filterText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#4ade80',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  sectionHeaderText: {
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionCount: {
    color: '#555',
    fontSize: 13,
  },
  sectionCountComplete: {
    color: '#4ade80',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
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
    color: '#555',
    fontSize: 16,
  },
});
