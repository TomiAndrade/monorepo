import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColeccion } from './useColeccion';

type Props = {
  code: string | null;
  onClose: () => void;
};

export function SubtractBar({ code, onClose }: Props) {
  const { coleccion, adjustSticker } = useColeccion();

  if (!code) return null;

  const value = coleccion[code] ?? 0;
  const repes = value >= 2 ? value - 1 : 0;
  const canMinus = value > 1;

  function handleMinus() {
    if (!canMinus) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    adjustSticker(code!, -1, 1);
  }

  return (
    <View style={styles.bar}>
      <View style={styles.info}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.count}>
          {repes > 0 ? `×${repes}` : 'tengo'}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.minusBtn,
          !canMinus && styles.minusBtnDisabled,
          pressed && canMinus && styles.minusBtnPressed,
        ]}
        onPress={handleMinus}
      >
        <Text style={[styles.minusBtnText, !canMinus && styles.minusBtnTextDisabled]}>
          −
        </Text>
      </Pressable>

      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>✓</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4ade80',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  code: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '700',
  },
  count: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  minusBtn: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minusBtnDisabled: {
    borderColor: '#2a2a2a',
    backgroundColor: '#111',
  },
  minusBtnPressed: {
    backgroundColor: '#0d2d1a',
  },
  minusBtnText: {
    color: '#4ade80',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  minusBtnTextDisabled: {
    color: '#2a2a2a',
  },
  closeBtn: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#4ade80',
    fontSize: 20,
    fontWeight: '600',
  },
});
