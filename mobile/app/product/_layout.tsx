// mobile/app/product/_layout.tsx
import { Stack } from 'expo-router';

export default function ProductLayout() {
  return (
    <Stack screenOptions={{ 
      headerTintColor: '#27ae60', 
      headerBackTitle: 'Retour',
      headerTitleStyle: { color: 'black' }
    }}>
      <Stack.Screen name="[id]" options={{ title: 'Détail' }} />
    </Stack>
  );
}