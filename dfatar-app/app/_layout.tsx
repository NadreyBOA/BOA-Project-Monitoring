import { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { DATABASE_NAME, migrateDbIfNeeded } from '../src/db/client';
import { colors } from '../src/utils/theme';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function RootNavigator() {
  const { colors: themeColors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: themeColors.background },
          headerStyle: { backgroundColor: themeColors.surface },
          headerTintColor: themeColors.text,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="customer/[id]"
          options={{ headerShown: true, title: 'Personne', headerBackTitle: 'Personnes' }}
        />
        <Stack.Screen
          name="customer/new"
          options={{ headerShown: true, presentation: 'modal', title: 'Personne' }}
        />
        <Stack.Screen
          name="transaction/new"
          options={{ headerShown: true, presentation: 'modal', title: 'Transaction' }}
        />
        <Stack.Screen
          name="transaction/[id]"
          options={{ headerShown: true, presentation: 'modal', title: 'Transaction' }}
        />
        <Stack.Screen
          name="paywall"
          options={{ headerShown: true, presentation: 'modal', title: 'Premium' }}
        />
        <Stack.Screen
          name="backup-auth"
          options={{ headerShown: true, presentation: 'modal', title: 'Sauvegarde en ligne' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Suspense fallback={<LoadingScreen />}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded} useSuspense>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
