import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";

export default function Layout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Cela cache la barre de titre par défaut sur tous les écrans */}
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="equipment/[id]" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
