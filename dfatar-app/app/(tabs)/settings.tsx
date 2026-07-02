import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ShieldCheck } from 'lucide-react-native';
import { getAllSettings, SETTINGS_KEYS, setSetting } from '../../src/db/settings';
import { colors, radius, spacing, fontSize } from '../../src/utils/theme';

const CURRENCIES = ['MAD', 'EUR', 'USD', 'XOF', 'DZD', 'TND'];

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [shopName, setShopName] = useState('');
  const [currency, setCurrency] = useState('MAD');
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const settings = await getAllSettings(db);
        setShopName(settings.shopName);
        setCurrency(settings.currency);
      })();
    }, [db])
  );

  async function persistShopName(value: string) {
    setShopName(value);
    await setSetting(db, SETTINGS_KEYS.shopName, value || 'Ma Boutique');
    flashSaved();
  }

  async function persistCurrency(value: string) {
    setCurrency(value);
    await setSetting(db, SETTINGS_KEYS.currency, value);
    flashSaved();
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nom de la boutique</Text>
      <TextInput
        value={shopName}
        onChangeText={setShopName}
        onEndEditing={(e) => persistShopName(e.nativeEvent.text)}
        placeholder="Ma Boutique"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <Text style={styles.hint}>Utilisé dans le message de rappel envoyé à vos clients.</Text>

      <Text style={styles.label}>Devise</Text>
      <View style={styles.chipsRow}>
        {CURRENCIES.map((c) => (
          <Pressable
            key={c}
            style={[styles.chip, currency === c && styles.chipActive]}
            onPress={() => persistCurrency(c)}
          >
            <Text style={[styles.chipText, currency === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      {saved && <Text style={styles.savedText}>Enregistré</Text>}

      <View style={styles.privacyCard}>
        <ShieldCheck color={colors.primary} size={20} />
        <Text style={styles.privacyText}>
          Toutes vos données (clients, transactions) restent stockées uniquement sur cet appareil. Rien n'est
          envoyé sur internet.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  savedText: {
    marginTop: spacing.md,
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  privacyCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
    alignItems: 'flex-start',
  },
  privacyText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
