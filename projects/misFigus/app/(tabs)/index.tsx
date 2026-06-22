import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SECTIONS, TOTAL, type Sticker } from '../../src/data';

export default function ColeccionScreen() {
  return (
    <View style={styles.container}>
      <SectionList
        sections={SECTIONS}
        keyExtractor={(row, rowIndex) => String(rowIndex)}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              {section.flag} {section.title}
            </Text>
            <Text style={styles.sectionCount}>
              0 / {section.data.flat().length}
            </Text>
          </View>
        )}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((sticker: Sticker) => (
              <View key={sticker.code} style={styles.cell}>
                <Text style={styles.cellCode}>{sticker.code}</Text>
              </View>
            ))}
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>misFigus WC2026</Text>
            <Text style={styles.headerSub}>0 / {TOTAL} figuritas</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  listContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
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
  row: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cellCode: {
    color: '#444',
    fontSize: 10,
    fontWeight: '500',
  },
});
