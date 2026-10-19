import '@/i18n';

import { Nunito_600SemiBold, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useReducedMotion } from 'react-native-reanimated';

import { db, initDb } from '@/db/client';
import { useMigrations } from '@/db/useMigrations';
import migrations from '../../drizzle/migrations';
import { useNotificationRouting } from '@/features/app/notification-routing';
import { useAppLifecycle } from '@/features/app/lifecycle';
import { useT } from '@/i18n';
import { startEntitlements } from '@/services/entitlements';
import { initNotifications } from '@/services/notifications';
import { useTheme } from '@/theme';
import { BannerHost } from '@/ui/Banner';
import { Text } from '@/ui/Text';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Waits for the database (instant on native; an asynchronous local connection on web). */
export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error>();
  useEffect(() => {
    let cancelled = false;
    void initDb().then(
      () => { if (!cancelled) setDbReady(true); },
      (error: unknown) => { if (!cancelled) setDbError(error instanceof Error ? error : new Error(String(error))); },
    );
    return () => { cancelled = true; };
  }, []);
  if (dbError) return <DatabaseError />;
  return dbReady ? <App /> : null;
}

function DatabaseError() {
  const { c } = useTheme();
  const t = useT();
  useEffect(() => { void SplashScreen.hideAsync().catch(() => undefined); }, []);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: c.bg }}>
      <Text variant="headline" align="center">{t('errors.genericTitle')}</Text>
      <Text variant="subhead" color="label2" align="center" style={{ marginTop: 8 }}>{t('errors.genericBody')}</Text>
    </View>
  );
}

function App() {
  const { c, isDark } = useTheme();
  const t = useT();
  const reduced = useReducedMotion();
  const migration = useMigrations(db, migrations);
  // SF Pro Rounded is built into iOS; Android and web use bundled Nunito (brief §4.3).
  const [fontsLoaded] = useFonts(Platform.OS === 'ios' ? {} : { Nunito_600SemiBold, Nunito_700Bold });

  useEffect(() => {
    initNotifications();
    void startEntitlements();
  }, []);

  const ready = (migration.success || migration.error != null) && fontsLoaded;
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  useAppLifecycle(migration.success);
  useNotificationRouting(ready && migration.success);

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: { ...base.colors, primary: c.tint, background: c.bg, card: c.bg, text: c.label, border: c.separator, notification: c.red },
    };
  }, [c, isDark]);

  if (!ready) return null;
  if (migration.error) {
    return <DatabaseError />;
  }

  const sheet = {
    presentation: 'formSheet' as const,
    sheetGrabberVisible: true,
    sheetAllowedDetents: [0.56, 1] as number[],
    sheetCornerRadius: 16,
    contentStyle: { backgroundColor: c.sheetBg },
    headerShown: false,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider value={navTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerTintColor: c.tint,
              headerTitleStyle: { color: c.label },
              headerBackTitle: t('common.back'),
              contentStyle: { backgroundColor: c.bg },
              animation: reduced ? 'fade' : 'default',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="result" options={{ animation: reduced ? 'fade' : 'fade_from_bottom' }} />
            <Stack.Screen
              name="paywall"
              options={{ presentation: 'fullScreenModal', headerShown: false, animation: reduced ? 'fade' : 'slide_from_bottom', gestureEnabled: false }}
            />
            <Stack.Screen name="success" options={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="method" options={sheet} />
            <Stack.Screen name="share" options={{ ...sheet, sheetAllowedDetents: [1] }} />
            <Stack.Screen name="log" options={{ ...sheet, sheetAllowedDetents: [0.7, 1] }} />
            <Stack.Screen name="name" options={{ ...sheet, sheetAllowedDetents: [0.45] }} />
            <Stack.Screen name="legal/[doc]" options={sheet} />
            <Stack.Screen name="score" options={sheet} />
            <Stack.Screen name="routine/[key]" options={{ ...sheet, sheetAllowedDetents: [1] }} />
            <Stack.Screen name="guide/[id]" options={{ headerShown: true, headerLargeTitle: false, title: '' }} />
            <Stack.Screen name="grocery" options={{ headerShown: true, title: t('grocery.title') }} />
            <Stack.Screen name="personalize" options={{ headerShown: true, title: t('personalize.title') }} />
          </Stack>
          <BannerHost />
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
