import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0d1117' },
          headerTintColor: '#39c5bb',
          headerTitleStyle: { fontWeight: '600', color: '#e6f7f6' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0d1117' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, title: 'Gastos' }} />
        <Stack.Screen
          name="form"
          options={{ title: 'Novo lançamento', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
