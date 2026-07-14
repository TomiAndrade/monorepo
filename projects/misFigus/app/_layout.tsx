import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ColeccionProvider } from '../src/ColeccionContext';
import { ThemeProvider } from '../src/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ColeccionProvider>
          <Slot />
        </ColeccionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
