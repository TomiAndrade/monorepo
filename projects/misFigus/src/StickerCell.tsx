import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Sticker } from './data';

type Props = {
  sticker: Sticker;
  value: number;
  onChange: (code: string, value: number) => void;
};

export function StickerCell({ sticker, value, onChange }: Props) {
  const owned = value >= 1;
  const repes = value >= 2 ? value - 1 : 0;

  function handleMark() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(sticker.code, 1);
  }

  function handlePlus() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(sticker.code, value + 1);
  }

  function handleMinus() {
    Haptics.impactAsync(
      value === 1
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );
    onChange(sticker.code, value - 1);
  }

  if (!owned) {
    return (
      <Pressable
        style={({ pressed }) => [styles.cell, styles.cellMissing, pressed && styles.cellPressed]}
        onPress={handleMark}
      >
        <Text style={[styles.code, styles.codeMissing]}>{sticker.code}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.cell, styles.cellOwned]}>
      <Text style={[styles.code, styles.codeOwned]}>{sticker.code}</Text>
      {repes > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>×{repes}</Text>
        </View>
      )}
      {/* Mitad izquierda — quitar */}
      <Pressable
        style={({ pressed }) => [styles.half, styles.halfLeft, pressed && styles.halfActive]}
        onPress={handleMinus}
      >
        <Text style={styles.halfText}>−</Text>
      </Pressable>
      {/* Mitad derecha — agregar */}
      <Pressable
        style={({ pressed }) => [styles.half, styles.halfRight, pressed && styles.halfActive]}
        onPress={handlePlus}
      >
        <Text style={styles.halfText}>+</Text>
      </Pressable>
    </View>
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
  half: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '42%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 3,
  },
  halfLeft: {
    left: 0,
  },
  halfRight: {
    right: 0,
  },
  halfActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.18)',
  },
  halfText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
});
