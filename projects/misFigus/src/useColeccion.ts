import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type Coleccion = Record<string, number>;

const STORAGE_KEY = 'coleccion-wc2026';

export function useColeccion() {
  const [coleccion, setColeccion] = useState<Coleccion>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setColeccion(JSON.parse(raw));
        } catch {
          // storage corrupted — start fresh
        }
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback((next: Coleccion) => {
    setColeccion(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setSticker = useCallback(
    (code: string, value: number) => {
      save({ ...coleccion, [code]: value });
    },
    [coleccion, save]
  );

  return { coleccion, loaded, setSticker };
}
