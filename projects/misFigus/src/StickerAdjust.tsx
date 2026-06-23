import * as Haptics from 'expo-haptics';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { FLAGS, TEAM_ES, type Sticker } from './data';
import { useColeccion } from './useColeccion';

type Props = {
  sticker: Sticker | null;
  onClose: () => void;
};

export function StickerAdjust({ sticker, onClose }: Props) {
  const { coleccion, adjustSticker } = useColeccion();

  if (!sticker) return null;

  const value = coleccion[sticker.code] ?? 0;
  const repes = value >= 2 ? value - 1 : 0;
  const canMinus = value > 1;

  function handlePlus() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    adjustSticker(sticker!.code, +1);
  }

  function handleMinus() {
    if (!canMinus) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    adjustSticker(sticker!.code, -1, 1);
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.info}>
          <Text style={styles.flag}>{FLAGS[sticker.team] ?? '🏳️'}</Text>
          <View style={styles.infoText}>
            <Text style={styles.code}>{sticker.code}</Text>
            <Text style={styles.name} numberOfLines={1}>{sticker.name}</Text>
            <Text style={styles.team}>{TEAM_ES[sticker.team] ?? sticker.team}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              !canMinus && styles.btnDisabled,
              pressed && canMinus && styles.btnPressed,
            ]}
            onPress={handleMinus}
          >
            <Text style={[styles.btnText, !canMinus && styles.btnTextDisabled]}>−</Text>
          </Pressable>

          <View style={styles.countBox}>
            <Text style={styles.count}>{value}</Text>
            <Text style={styles.countLabel}>
              {repes > 0 ? `${repes} repe${repes > 1 ? 's' : ''}` : 'tengo'}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handlePlus}
          >
            <Text style={styles.btnText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>Mantené presionado en la celda para quitar de la colección</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#141414',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  flag: {
    fontSize: 36,
  },
  infoText: {
    flex: 1,
  },
  code: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: '700',
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  team: {
    color: '#555',
    fontSize: 13,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  btn: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    borderColor: '#2a2a2a',
    backgroundColor: '#111',
  },
  btnPressed: {
    backgroundColor: '#0d2d1a',
  },
  btnText: {
    color: '#4ade80',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
  },
  btnTextDisabled: {
    color: '#333',
  },
  countBox: {
    flex: 1,
    alignItems: 'center',
  },
  count: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 52,
  },
  countLabel: {
    color: '#555',
    fontSize: 13,
    marginTop: 2,
  },
  hint: {
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
  },
});
