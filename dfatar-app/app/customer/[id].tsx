import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { MessageCircle, Pencil, Trash2, Minus, Plus } from 'lucide-react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { TransactionRow } from '../../src/components/TransactionRow';
import { deleteCustomer, getCustomerWithBalance } from '../../src/db/customers';
import { getProfile, type Profile } from '../../src/db/settings';
import { listTransactionsForCustomer } from '../../src/db/transactions';
import type { CustomerWithBalance, Transaction } from '../../src/types';
import { radius, spacing, fontSize, colors as ColorsType } from '../../src/utils/theme';
import { useTheme } from '../../src/theme/ThemeContext';
import { formatAmount } from '../../src/utils/currency';
import { buildReminderMessage, openWhatsAppReminder } from '../../src/utils/whatsapp';

export default function CustomerDetailScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [customerRow, txRows, profileRow] = await Promise.all([
      getCustomerWithBalance(db, id),
      listTransactionsForCustomer(db, id),
      getProfile(db),
    ]);
    setCustomer(customerRow);
    setTransactions(txRows);
    setProfile(profileRow);
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleDelete() {
    if (!customer) return;
    Alert.alert('Supprimer cette personne ?', `${customer.name} et son historique seront définitivement supprimés.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteCustomer(db, customer.id);
          router.back();
        },
      },
    ]);
  }

  async function handleReminder() {
    if (!customer || !customer.phone || !profile) return;
    const message = buildReminderMessage(customer.name, customer.balance, customer.currency, profile.displayName, profile.accountType);
    await openWhatsAppReminder(customer.phone, message);
  }

  if (!customer) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Personne' }} />
      </View>
    );
  }

  const owesMoney = customer.balance > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: customer.name,
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push(`/customer/new?id=${customer.id}`)} hitSlop={8}>
                <Pencil color={colors.primary} size={20} />
              </Pressable>
              <Pressable onPress={handleDelete} hitSlop={8}>
                <Trash2 color={colors.danger} size={20} />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{owesMoney ? 'Solde dû' : 'Aucun solde dû'}</Text>
          <Text style={[styles.balanceAmount, owesMoney ? styles.balancePositive : styles.balanceZero]}>
            {formatAmount(customer.balance, customer.currency)}
          </Text>
          {!!customer.phone && <Text style={styles.phone}>{customer.phone}</Text>}
          {!!customer.address && <Text style={styles.address}>{customer.address}</Text>}
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, styles.creditButton]}
            onPress={() => router.push(`/transaction/new?customerId=${customer.id}&type=credit`)}
          >
            <Plus color={colors.credit} size={18} />
            <Text style={[styles.actionButtonText, { color: colors.credit }]}>Dette</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.paymentButton]}
            onPress={() => router.push(`/transaction/new?customerId=${customer.id}&type=payment`)}
          >
            <Minus color={colors.payment} size={18} />
            <Text style={[styles.actionButtonText, { color: colors.payment }]}>Remboursement</Text>
          </Pressable>
        </View>

        {!!customer.phone && (
          <Pressable style={styles.reminderButton} onPress={handleReminder}>
            <MessageCircle color="#fff" size={18} />
            <Text style={styles.reminderButtonText}>Envoyer un rappel WhatsApp</Text>
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Historique</Text>
        {transactions.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="Aucune transaction"
            subtitle="Ajoutez une dette ou un remboursement pour commencer l'historique."
          />
        ) : (
          transactions.map((t) => <TransactionRow key={t.id} transaction={t} currency={customer.currency} />)
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: typeof ColorsType) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: spacing.xl * 2,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    balanceCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    balanceLabel: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    balanceAmount: {
      fontSize: fontSize.xl,
      fontWeight: '800',
    },
    balancePositive: {
      color: colors.danger,
    },
    balanceZero: {
      color: colors.text,
    },
    phone: {
      marginTop: spacing.sm,
      fontSize: fontSize.sm,
      color: colors.textMuted,
    },
    address: {
      marginTop: 2,
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
    },
    creditButton: {
      backgroundColor: colors.dangerMuted,
      borderColor: colors.dangerMuted,
    },
    paymentButton: {
      backgroundColor: colors.primaryMuted,
      borderColor: colors.primaryMuted,
    },
    actionButtonText: {
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    reminderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: '#25D366',
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.lg,
    },
    reminderButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: fontSize.sm,
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
  });
}
