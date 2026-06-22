import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: '#1a1a1a' },
        tabBarActiveTintColor: '#4ade80',
        tabBarInactiveTintColor: '#555',
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
