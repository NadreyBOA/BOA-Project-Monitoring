import React, { Suspense } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './src/screens/DashboardScreen';
import AccountsScreen from './src/screens/AccountsScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import { WebFinanceProvider } from './src/context/WebFinanceProvider';

const Tab = createBottomTabNavigator();

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

function Tabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Tableau de bord" component={DashboardScreen} />
        <Tab.Screen name="Comptes" component={AccountsScreen} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
        <Tab.Screen name="Budgets" component={BudgetsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function NativeApp() {
  // Lazy-required so expo-sqlite (a native module) is never touched on web.
  const { SQLiteProvider } = require('expo-sqlite');
  const { SqliteFinanceProvider } = require('./src/context/SqliteFinanceProvider');
  const { DATABASE_NAME, migrateDbIfNeeded } = require('./src/db/database');

  return (
    <Suspense fallback={<Loading />}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded} useSuspense>
        <SqliteFinanceProvider>
          <Tabs />
        </SqliteFinanceProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      {Platform.OS === 'web' ? (
        <WebFinanceProvider>
          <Tabs />
        </WebFinanceProvider>
      ) : (
        <NativeApp />
      )}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
