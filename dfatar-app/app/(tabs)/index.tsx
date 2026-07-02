import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Plus, Search, Users } from 'lucide-react-native';
import { CustomerRow } from '../../src/components/CustomerRow';
import { EmptyState } from '../../src/components/EmptyState';
import { listCustomersWithBalance } from '../../src/db/customers';
import { getAllSettings } from '../../src/db/settings';
import type { CustomerWithBalance } from '../../src/types';
import { colors, radius, spacing, fontSize } from '../../src/utils/theme';
import { formatAmount } from '../../src/utils/currency';

export default function ClientsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [currency, setCurrency] = useState('MAD');
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [rows, settings] = await Promise.all([listCustomersWithBalance(db), getAllSettings(db)]);
        if (!cancelled) {
          setCustomers(rows);
          setCurrency(settings.currency);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [db])
  );

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  const totalDue = customers.reduce((sum, c) => sum + Math.max(c.balance, 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalLabel}>Total dû par vos clients</Text>
        <Text style={styles.totalAmount}>{formatAmount(totalDue, currency)}</Text>
      </View>

      <View style={styles.searchBar}>
        <Search color={colors.textMuted} size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un client"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <CustomerRow customer={item} currency={currency} />}
        ListEmptyComponent={
          <EmptyState
            icon={Users}
            title={customers.length === 0 ? 'Aucun client pour le moment' : 'Aucun résultat'}
            subtitle={
              customers.length === 0
                ? 'Ajoutez votre premier client pour commencer à suivre ses crédits.'
                : 'Essayez un autre nom.'
            }
          />
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/customer/new')}>
        <Plus color="#fff" size={26} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
