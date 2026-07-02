import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Plus, Search, Users } from 'lucide-react-native';
import { CustomerRow } from '../../src/components/CustomerRow';
import { EmptyState } from '../../src/components/EmptyState';
import { countCustomers, listCustomersWithBalance, totalsByCurrency, type CurrencyTotal } from '../../src/db/customers';
import { getProfile, isOnboardingComplete } from '../../src/db/settings';
import { isPremium, FREE_CUSTOMER_LIMIT } from '../../src/premium';
import type { CustomerWithBalance } from '../../src/types';
import { radius, spacing, fontSize, colors as ColorsType } from '../../src/utils/theme';
import { useTheme } from '../../src/theme/ThemeContext';
import { formatAmount } from '../../src/utils/currency';

export default function PeopleScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const db = useSQLiteContext();
  const router = useRouter();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [totals, setTotals] = useState<CurrencyTotal[]>([]);
  const [baseCurrency, setBaseCurrency] = useState('MAD');
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const done = await isOnboardingComplete(db);
        if (cancelled) return;
        setNeedsOnboarding(!done);
        setOnboardingChecked(true);
        if (!done) return;
        const [rows, totalsRows, profile] = await Promise.all([
          listCustomersWithBalance(db),
          totalsByCurrency(db),
          getProfile(db),
        ]);
        if (!cancelled) {
          setCustomers(rows);
          setTotals(totalsRows);
          setBaseCurrency(profile.baseCurrency);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [db])
  );

  if (!onboardingChecked) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (needsOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  async function handleAddPress() {
    const [count, premium] = await Promise.all([countCustomers(db), isPremium(db)]);
    if (!premium && count >= FREE_CUSTOMER_LIMIT) {
      router.push('/paywall?fromLimit=1');
      return;
    }
    router.push('/customer/new');
  }

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalLabel}>Total dû par vos personnes</Text>
        <View style={styles.amountsRow}>
          {totals.length === 0 ? (
            <Text style={styles.totalAmount}>{formatAmount(0, baseCurrency)}</Text>
          ) : (
            totals.map((t, i) => (
              <Text key={t.currency} style={i === 0 ? styles.totalAmount : styles.totalAmountSecondary}>
                {formatAmount(t.amount, t.currency)}
              </Text>
            ))
          )}
        </View>
      </View>

      <View style={styles.searchBar}>
        <Search color={colors.textMuted} size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une personne"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <CustomerRow customer={item} />}
        ListEmptyComponent={
          <EmptyState
            icon={Users}
            title={customers.length === 0 ? 'Aucune personne pour le moment' : 'Aucun résultat'}
            subtitle={
              customers.length === 0
                ? 'Ajoutez la première personne qui vous doit de l\'argent.'
                : 'Essayez un autre nom.'
            }
          />
        }
      />

      <Pressable style={styles.fab} onPress={handleAddPress} accessibilityLabel="Nouvelle personne">
        <Plus color="#fff" size={26} />
      </Pressable>
    </View>
  );
}

function createStyles(colors: typeof ColorsType) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    totalLabel: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    amountsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      gap: spacing.sm,
    },
    totalAmount: {
      fontSize: fontSize.xl,
      fontWeight: '800',
      color: colors.text,
    },
    totalAmountSecondary: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.textMuted,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.text,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl * 2,
      flexGrow: 1,
    },
    fab: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  });
}
