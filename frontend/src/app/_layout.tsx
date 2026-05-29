import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/theme-context';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function LayoutContent() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="cadastro" />
      </Stack>
    </SafeAreaView>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LayoutContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
