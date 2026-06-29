import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES } from '../types';

export default function BudgetsScreen() {
  const { budgets, upsertBudget, deleteBudget } = useFinance();
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState('');

  const handleSave = async () => {
    const parsed = parseFloat(limit.replace(',', '.'));
    if (!parsed || parsed <= 0) {
      Alert.alert('Montant invalide');
      return;
    }
    await upsertBudget(category, parsed);
    setLimit('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.typeRow}>
          {EXPENSE_CATEGORIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.typeChip, category === c && styles.typeChipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.typeChipText, category === c && styles.typeChipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Plafond mensuel"
            keyboardType="numeric"
            value={limit}
            onChangeText={setLimit}
          />
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Définir</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun budget défini.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() =>
              Alert.alert('Supprimer ce budget ?', '', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => deleteBudget(item.id) },
              ])
            }
            style={styles.budgetRow}
          >
            <Text style={styles.budgetCategory}>{item.category}</Text>
            <Text style={styles.budgetLimit}>{item.monthlyLimit.toFixed(2)} € / mois</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  form: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  label: { fontWeight: '600', marginBottom: 6 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  typeChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeChipText: { color: '#334155', fontSize: 12 },
  typeChipTextActive: { color: 'white' },
  row: { flexDirection: 'row', gap: 10 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12 },
  saveButton: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  empty: { color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  budgetCategory: { fontWeight: '600' },
  budgetLimit: { color: '#475569' },
});
