import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Sticker } from './data';

type Props = {
  sticker: Sticker;
  value: number;
  subtractActive: boolean;
  onTap: (code: string) => void;
  onReset: (code: string) => void;
  onOpenSubtract: (code: string) => void;
};

export function StickerCell({
  sticker, value, subtractActive, onTap, onReset, onOpenSubtract,
}: Props) {
  const owned = value >= 1;
  const repes = value >= 2 ? value - 1 : 0;
  // Evita que onPress se dispare al soltar un long-press
  const longPressTriggered = useRef(false);

  function handlePress() {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTap(sticker.code);
  }

  function handleLongPress() {
    longPressTriggered.current = true;
    if (!owned) return; // falta: no hace nada
    if (value === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onReset(sticker.code);
    } else {
      // value >= 2: abre control de resta
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onOpenSubtract(sticker.code);
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cell,
        owned ? styles.cellOwned : styles.cellMissing,
        subtractActive && styles.cellSubtractActive,
        pressed && styles.cellPressed,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
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
  cellSubtractActive: {
    borderColor: '#fff',
    borderWidth: 2,
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
