import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFinance } from '../context/FinanceContext';

function formatAmount(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DashboardScreen() {
  const { accounts, transactions, budgets } = useFinance();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const { monthIncome, monthExpense, categorySpend } = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let income = 0;
    let expense = 0;
    const byCategory: Record<string, number> = {};

    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (d.getMonth() !== month || d.getFullYear() !== year) continue;
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
        byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
      }
    }
    return { monthIncome: income, monthExpense: expense, categorySpend: byCategory };
  }, [transactions]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Tableau de bord</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Solde total</Text>
        <Text style={styles.balanceValue}>{formatAmount(totalBalance)} €</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.smallCard, { backgroundColor: '#dcfce7' }]}>
          <Text style={styles.smallLabel}>Revenus (mois)</Text>
          <Text style={[styles.smallValue, { color: '#16a34a' }]}>+{formatAmount(monthIncome)} €</Text>
        </View>
        <View style={[styles.smallCard, { backgroundColor: '#fee2e2' }]}>
          <Text style={styles.smallLabel}>Dépenses (mois)</Text>
          <Text style={[styles.smallValue, { color: '#dc2626' }]}>-{formatAmount(monthExpense)} €</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Budgets du mois</Text>
      {budgets.length === 0 && <Text style={styles.empty}>Aucun budget défini.</Text>}
      {budgets.map((b) => {
        const spent = categorySpend[b.category] ?? 0;
        const ratio = b.monthlyLimit > 0 ? Math.min(spent / b.monthlyLimit, 1) : 0;
        const over = spent > b.monthlyLimit;
        return (
          <View key={b.id} style={styles.budgetItem}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetCategory}>{b.category}</Text>
              <Text style={[styles.budgetAmount, over && { color: '#dc2626' }]}>
                {formatAmount(spent)} € / {formatAmount(b.monthlyLimit)} €
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${ratio * 100}%`, backgroundColor: over ? '#dc2626' : '#2563eb' },
                ]}
              />
            </View>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>Comptes</Text>
      {accounts.map((a) => (
        <View key={a.id} style={styles.accountRow}>
          <View style={[styles.accountDot, { backgroundColor: a.color }]} />
          <Text style={styles.accountName}>{a.name}</Text>
          <Text style={styles.accountBalance}>{formatAmount(a.balance)} €</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  balanceCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 16 },
  balanceLabel: { color: '#cbd5e1', fontSize: 14 },
  balanceValue: { color: 'white', fontSize: 32, fontWeight: '700', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  smallCard: { flex: 1, borderRadius: 12, padding: 12 },
  smallLabel: { fontSize: 12, color: '#475569' },
  smallValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 8, marginBottom: 8 },
  empty: { color: '#94a3b8', fontStyle: 'italic', marginBottom: 8 },
  budgetItem: { marginBottom: 12 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  budgetCategory: { fontWeight: '600' },
  budgetAmount: { color: '#475569' },
  progressTrack: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  accountDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  accountName: { flex: 1, fontWeight: '500' },
  accountBalance: { fontWeight: '600' },
});
