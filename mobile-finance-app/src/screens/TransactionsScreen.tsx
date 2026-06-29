import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Transaction, TransactionType } from '../types';

export default function TransactionsScreen() {
  const { accounts, transactions, addTransaction, deleteTransaction } = useFinance();
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [accountId, setAccountId] = useState<string>('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const openModal = () => {
    if (accounts.length === 0) {
      Alert.alert('Aucun compte', "Créez d'abord un compte dans l'onglet Comptes.");
      return;
    }
    setAccountId(accounts[0].id);
    setType('expense');
    setCategory(EXPENSE_CATEGORIES[0]);
    setAmount('');
    setNote('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!accountId || !parsed || parsed <= 0) {
      Alert.alert('Montant invalide');
      return;
    }
    await addTransaction({
      accountId,
      category,
      type,
      amount: parsed,
      note,
      date: new Date().toISOString(),
    });
    setModalVisible(false);
  };

  const handleDelete = (tx: Transaction) => {
    Alert.alert('Supprimer la transaction ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteTransaction(tx) },
    ]);
  };

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? '—';

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucune transaction.</Text>}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => handleDelete(item)} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowCategory}>{item.category}</Text>
              <Text style={styles.rowMeta}>
                {accountName(item.accountId)} · {new Date(item.date).toLocaleDateString('fr-FR')}
              </Text>
              {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
            </View>
            <Text style={[styles.rowAmount, item.type === 'income' ? styles.income : styles.expense]}>
              {item.type === 'income' ? '+' : '-'}
              {item.amount.toFixed(2)} €
            </Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={openModal}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle transaction</Text>

            <View style={styles.typeRow}>
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => {
                    setType(t);
                    setCategory(t === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
                  }}
                >
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {t === 'expense' ? 'Dépense' : 'Revenu'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Compte</Text>
            <View style={styles.typeRow}>
              {accounts.map((a) => (
                <Pressable
                  key={a.id}
                  style={[styles.typeChip, accountId === a.id && styles.typeChipActive]}
                  onPress={() => setAccountId(a.id)}
                >
                  <Text style={[styles.typeChipText, accountId === a.id && styles.typeChipTextActive]}>
                    {a.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.typeRow}>
              {categories.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.typeChip, category === c && styles.typeChipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.typeChipText, category === c && styles.typeChipTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Montant"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Note (optionnel)"
              value={note}
              onChangeText={setNote}
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text>Annuler</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
                <Text style={{ color: 'white' }}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowCategory: { fontWeight: '600' },
  rowMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  rowNote: { color: '#94a3b8', fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  rowAmount: { fontWeight: '700', fontSize: 15 },
  income: { color: '#16a34a' },
  expense: { color: '#dc2626' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: 'white', fontSize: 28, lineHeight: 28 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  typeChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeChipText: { color: '#334155', fontSize: 12 },
  typeChipTextActive: { color: 'white' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelButton: { backgroundColor: '#f1f5f9' },
  saveButton: { backgroundColor: '#2563eb' },
});
