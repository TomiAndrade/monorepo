import { Pressable, StyleSheet, Text, View } from 'react-native';
import { makeUseThemedStyles } from './ThemeContext';

export type UndoAction = {
  code: string;
  prevValue: number;
  newValue: number;
};

type Props = {
  action: UndoAction | null;
  bottomOffset: number;
  onUndo: () => void;
};

export function UndoToast({ action, bottomOffset, onUndo }: Props) {
  const styles = useStyles();
  if (!action) return null;

  const label = action.newValue === 1 ? 'tengo' : `×${action.newValue - 1}`;

  return (
    // box-none: el wrapper posiciona pero no bloquea el scroll
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.toast}>
        <Text style={styles.msg}>{action.code} → {label}</Text>
        <Pressable style={styles.undoBtn} onPress={onUndo}>
          <Text style={styles.undoBtnText}>Deshacer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeUseThemedStyles((c) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 12,
      right: 12,
      alignItems: 'center',
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
    },
    msg: {
      flex: 1,
      color: c.text,
      fontSize: 14,
      fontWeight: '500',
    },
    undoBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: c.primary,
    },
    undoBtnText: {
      color: c.onPrimary,
      fontSize: 13,
      fontWeight: '600',
    },
  })
);
