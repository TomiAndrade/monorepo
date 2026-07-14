import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Sticker } from './data';
import { makeUseThemedStyles } from './ThemeContext';

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
  const styles = useStyles();
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

const useStyles = makeUseThemedStyles((c) =>
  StyleSheet.create({
    cell: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      overflow: 'hidden',
    },
    cellMissing: {
      backgroundColor: c.surfaceAlt,
      borderColor: c.border,
    },
    cellOwned: {
      backgroundColor: c.ownedBg,
      borderColor: c.owned,
    },
    cellSubtractActive: {
      borderColor: c.primary,
      borderWidth: 2,
    },
    cellPressed: {
      opacity: 0.6,
    },
    code: {
      fontSize: 16,
      fontWeight: '700',
    },
    codeMissing: {
      color: c.textFaint,
    },
    codeOwned: {
      color: c.owned,
    },
    badge: {
      position: 'absolute',
      top: 3,
      right: 3,
      backgroundColor: c.repe,
      borderRadius: 5,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    badgeText: {
      color: c.onRepe,
      fontSize: 10,
      fontWeight: 'bold',
    },
  })
);
