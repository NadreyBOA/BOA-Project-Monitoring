import { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { DATABASE_NAME, migrateDbIfNeeded } from '../src/db/client';
import { colors } from '../src/utils/theme';
import { ThemeProvider } from '../src/theme/ThemeContext';

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded} useSuspense>
        <ThemeProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
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
          </Stack>
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
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
