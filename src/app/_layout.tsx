import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppLockGuard } from "~/features/security";
import "~/global.css";
import { useFonts } from "~/hooks/use-load-fonts";
import { useMigrations } from "~/hooks/use-migrations";
import { QueryProvider } from "~/providers/react-query";
import { ThemeProvider } from "~/providers/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { ready, error } = useAppReady();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (error) throw error;
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <QueryProvider>
          <BottomSheetModalProvider>
            <AppLockGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="chat" options={{ presentation: "modal" }} />
              </Stack>
            </AppLockGuard>
          </BottomSheetModalProvider>
        </QueryProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function useAppReady() {
  const fonts = useFonts();
  const migrations = useMigrations();

  return {
    ready: fonts.success && migrations.success,
    error: fonts.error ?? migrations.error,
  } as const;
}
