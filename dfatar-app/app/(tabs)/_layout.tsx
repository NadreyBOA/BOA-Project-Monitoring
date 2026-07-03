import { Pressable } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Users, Settings, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';

function SettingsBackButton() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push('/')} hitSlop={8} accessibilityLabel="Retour">
      <ChevronLeft color={colors.text} size={24} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Personnes',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          headerLeft: () => <SettingsBackButton />,
        }}
      />
    </Tabs>
  );
}
