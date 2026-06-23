import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ColeccionProvider } from '../src/ColeccionContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ColeccionProvider>
        <Slot />
      </ColeccionProvider>
    </SafeAreaProvider>
  );
}
