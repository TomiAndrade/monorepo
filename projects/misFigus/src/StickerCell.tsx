import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Sticker } from './data';

type Props = {
  sticker: Sticker;
  value: number;
  onChange: (code: string, value: number) => void;
  onSelect: (code: string) => void;
};

export function StickerCell({ sticker, value, onChange, onSelect }: Props) {
  const owned = value >= 1;
  const repes = value >= 2 ? value - 1 : 0;

  function handlePress() {
    if (!owned) {
      // único tap que cambia cantidad: falta → tengo
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(sticker.code, 1);
    } else {
      // abre controles +/−
      onSelect(sticker.code);
    }
  }

  function handleLongPress() {
    if (!owned) return;
    // único camino para volver a 0
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onChange(sticker.code, 0);
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cell,
        owned ? styles.cellOwned : styles.cellMissing,
        pressed && styles.cellPressed,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <Text style={[styles.code, owned ? styles.codeOwned : styles.codeMissing]}>
        {sticker.code}
      </Text>
      {repes > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>×{repes}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  cellMissing: {
    backgroundColor: '#1a1a1a',
    borderColor: '#2a2a2a',
  },
  cellOwned: {
    backgroundColor: '#0d2d1a',
    borderColor: '#4ade80',
  },
  cellPressed: {
    opacity: 0.6,
  },
  code: {
    fontSize: 10,
    fontWeight: '500',
  },
  codeMissing: {
    color: '#444',
  },
  codeOwned: {
    color: '#4ade80',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#f59e0b',
    borderRadius: 3,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#000',
    fontSize: 7,
    fontWeight: 'bold',
  },
});
