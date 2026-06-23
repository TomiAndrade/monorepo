import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Coleccion = Record<string, number>;

const STORAGE_KEY = 'coleccion-wc2026';

type ColeccionCtx = {
  coleccion: Coleccion;
  loaded: boolean;
  setSticker: (code: string, value: number) => void;
};

const ColeccionContext = createContext<ColeccionCtx | null>(null);

export function ColeccionProvider({ children }: { children: React.ReactNode }) {
  const [coleccion, setColeccion] = useState<Coleccion>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setColeccion(JSON.parse(raw)); } catch { /* corrupted — start fresh */ }
      }
      setLoaded(true);
    });
  }, []);

  const setSticker = useCallback((code: string, value: number) => {
    setColeccion((prev) => {
      const next = { ...prev, [code]: value };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <ColeccionContext.Provider value={{ coleccion, loaded, setSticker }}>
      {children}
    </ColeccionContext.Provider>
  );
}

export function useColeccion(): ColeccionCtx {
  const ctx = useContext(ColeccionContext);
  if (!ctx) throw new Error('useColeccion must be used inside ColeccionProvider');
  return ctx;
}
