import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Plus, Search, Users } from 'lucide-react-native';
import { CustomerRow } from '../../src/components/CustomerRow';
import { EmptyState } from '../../src/components/EmptyState';
import { countCustomers, listCustomersWithBalance, totalDue } from '../../src/db/customers';
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
  const [total, setTotal] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState('MAD');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'due' | 'all'>('due');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const done = await isOnboardingComplete(db);
        if (cancelled) return;
        setNeedsOnboarding(!done);
        setOnboardingChecked(true);
        if (!done) return;
        const [rows, dueTotal, profile] = await Promise.all([
          listCustomersWithBalance(db),
          totalDue(db),
          getProfile(db),
        ]);
        if (!cancelled) {
          setCustomers(rows);
          setTotal(dueTotal);
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

  const dueCount = customers.filter((c) => c.balance > 0).length;
  const filtered = customers
    .filter((c) => (filter === 'due' ? c.balance > 0 : true))
    .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  const noneOwe = customers.length > 0 && filter === 'due' && dueCount === 0 && !query.trim();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalLabel}>Total dû par vos personnes</Text>
        <Text style={styles.totalAmount}>{formatAmount(total, baseCurrency)}</Text>
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterPill, filter === 'due' && styles.filterPillActive]}
          onPress={() => setFilter('due')}
        >
          <Text style={[styles.filterPillText, filter === 'due' && styles.filterPillTextActive]}>
            Doit de l'argent ({dueCount})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterPillText, filter === 'all' && styles.filterPillTextActive]}>
            Tous ({customers.length})
          </Text>
        </Pressable>
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
        renderItem={({ item }) => <CustomerRow customer={item} currency={baseCurrency} />}
        ListEmptyComponent={
          <EmptyState
            icon={Users}
            title={customers.length === 0 ? 'Aucune personne pour le moment' : noneOwe ? 'Personne ne vous doit rien' : 'Aucun résultat'}
            subtitle={
              customers.length === 0
                ? 'Ajoutez la première personne qui vous doit de l\'argent.'
                : noneOwe
                  ? 'Tout le monde est à jour. Consultez "Tous" pour voir l\'historique complet.'
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
    totalAmount: {
      fontSize: fontSize.xl,
      fontWeight: '800',
      color: colors.text,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    filterPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 3,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterPillText: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.textMuted,
    },
    filterPillTextActive: {
      color: '#fff',
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
