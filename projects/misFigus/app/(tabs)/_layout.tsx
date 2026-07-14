import { Tabs } from 'expo-router';
import { useTheme } from '../../src/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.tabBarBg, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Colección', tabBarLabel: 'Colección' }}
      />
      <Tabs.Screen
        name="carga"
        options={{ title: 'Carga rápida', tabBarLabel: 'Carga rápida' }}
      />
    </Tabs>
  );
}
