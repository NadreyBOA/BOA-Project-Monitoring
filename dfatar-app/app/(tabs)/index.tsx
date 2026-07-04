import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChevronDown, Plus, Search, Users } from 'lucide-react-native';
import { CustomerRow } from '../../src/components/CustomerRow';
import { EmptyState } from '../../src/components/EmptyState';
import { SpacePicker } from '../../src/components/SpacePicker';
import { countCustomers, listCustomersWithBalance, totalDue } from '../../src/db/customers';
import { getProfile, isOnboardingComplete } from '../../src/db/settings';
import {
  createSpace,
  deleteSpace,
  getCurrentSpace,
  listSpaces,
  renameSpace,
  setCurrentSpaceId,
  MAX_FREE_SPACES,
  type Space,
} from '../../src/db/spaces';
import { isPremium, FREE_CUSTOMER_LIMIT } from '../../src/premium';
import type { AccountType, CustomerWithBalance } from '../../src/types';
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
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'due' | 'all'>('due');
  const [currentSpace, setCurrentSpaceState] = useState<Space | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [premium, setPremium] = useState(false);
  const [spacePickerOpen, setSpacePickerOpen] = useState(false);

  async function loadSpaceData(spaceId: string) {
    const [rows, dueTotal, profile, spaceList, premiumFlag] = await Promise.all([
      listCustomersWithBalance(db, spaceId),
      totalDue(db, spaceId),
      getProfile(db),
      listSpaces(db),
      isPremium(db),
    ]);
    setCustomers(rows);
    setTotal(dueTotal);
    setBaseCurrency(profile.baseCurrency);
    setSpaces(spaceList);
    setPremium(premiumFlag);
  }

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const done = await isOnboardingComplete(db);
        if (cancelled) return;
        setNeedsOnboarding(!done);
        setOnboardingChecked(true);
        if (!done) return;
        const space = await getCurrentSpace(db);
        if (!space || cancelled) return;
        setCurrentSpaceState(space);
        await loadSpaceData(space.id);
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
  if (!currentSpace) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  async function handleAddPress() {
    const [count, premiumFlag] = await Promise.all([countCustomers(db, currentSpace!.id), isPremium(db)]);
    if (!premiumFlag && count >= FREE_CUSTOMER_LIMIT) {
      router.push('/paywall?fromLimit=1');
      return;
    }
    router.push('/customer/new');
  }

  async function handleSelectSpace(id: string) {
    await setCurrentSpaceId(db, id);
    setSpacePickerOpen(false);
    const space = await getCurrentSpace(db);
    setCurrentSpaceState(space);
    if (space) await loadSpaceData(space.id);
  }

  async function handleCreateSpace(name: string, accountType: AccountType) {
    const id = await createSpace(db, { name, accountType });
    await setCurrentSpaceId(db, id);
    setSpacePickerOpen(false);
    const space = await getCurrentSpace(db);
    setCurrentSpaceState(space);
    if (space) await loadSpaceData(space.id);
  }

  function handleLockedCreatePress() {
    setSpacePickerOpen(false);
    router.push('/paywall');
  }

  async function handleRenameSpace(id: string, name: string) {
    await renameSpace(db, id, name);
    if (currentSpace?.id === id) setCurrentSpaceState({ ...currentSpace, name });
    setSpaces(await listSpaces(db));
  }

  async function handleDeleteSpace(id: string) {
    await deleteSpace(db, id);
    if (currentSpace?.id === id) {
      const remaining = await listSpaces(db);
      const next = remaining[0] ?? null;
      if (next) {
        await setCurrentSpaceId(db, next.id);
        setCurrentSpaceState(next);
        await loadSpaceData(next.id);
      }
    } else {
      setSpaces(await listSpaces(db));
    }
  }

  const canCreateSpace = premium || spaces.length < MAX_FREE_SPACES;

  const dueCount = customers.filter((c) => c.balance > 0).length;
  const filteredCustomers = customers
    .filter((c) => (filter === 'due' ? c.balance > 0 : true))
    .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  const noneOwe = customers.length > 0 && filter === 'due' && dueCount === 0 && !query.trim();

  type Row = { kind: 'divider'; label: string } | { kind: 'customer'; customer: CustomerWithBalance };
  const rows: Row[] = [];
  let dividerAdded = false;
  filteredCustomers.forEach((c) => {
    if (filter === 'all' && c.balance <= 0 && !dividerAdded) {
      dividerAdded = true;
      rows.push({ kind: 'divider', label: 'Soldées' });
    }
    rows.push({ kind: 'customer', customer: c });
  });

  return (
    <View style={styles.container}>
      <Pressable style={styles.spaceSwitcher} onPress={() => setSpacePickerOpen(true)}>
        <Text style={styles.spaceSwitcherText} numberOfLines={1}>
          {currentSpace.name}
        </Text>
        <ChevronDown color={colors.textMuted} size={16} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.totalLabel}>On vous doit au total</Text>
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
        data={rows}
        keyExtractor={(item, index) => (item.kind === 'divider' ? `divider-${index}` : item.customer.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) =>
          item.kind === 'divider' ? (
            <Text style={styles.listDivider}>{item.label}</Text>
          ) : (
            <CustomerRow customer={item.customer} currency={baseCurrency} />
          )
        }
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

      <SpacePicker
        visible={spacePickerOpen}
        spaces={spaces}
        currentSpaceId={currentSpace.id}
        canCreateSpace={canCreateSpace}
        onClose={() => setSpacePickerOpen(false)}
        onSelect={handleSelectSpace}
        onCreate={handleCreateSpace}
        onLockedCreatePress={handleLockedCreatePress}
        onRename={handleRenameSpace}
        onDelete={handleDeleteSpace}
      />
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
    spaceSwitcher: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      maxWidth: '80%',
    },
    spaceSwitcherText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.text,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
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
    listDivider: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.textMuted,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
