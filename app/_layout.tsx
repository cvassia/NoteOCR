import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AppDarkTheme, AppLightTheme } from '../components/ui/theme';
import { AuthProvider } from '../context/AuthContext';
import { DocumentsProvider } from '../context/DocumentsContext';
import i18n from '../utils';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [hasOpened, setHasOpened] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const opened = await AsyncStorage.getItem('hasOpenedApp');
      setHasOpened(!!opened);
    };
    checkFirstLaunch();
  }, []);

  if (hasOpened === null) {
    // Loader while reading AsyncStorage
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? AppDarkTheme : AppLightTheme}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <DocumentsProvider>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Redirect to /welcome/language if first launch */}
              {!hasOpened && <Redirect href="/welcome/language" />}

              {/* Main screens */}
              <Stack.Screen name="welcome" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </DocumentsProvider>
        </AuthProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}
