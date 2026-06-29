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
import { ACCOUNT_COLORS, Account, AccountType } from '../types';

const TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Compte courant',
  savings: 'Épargne',
  cash: 'Espèces',
  credit: 'Crédit',
};

export default function AccountsScreen() {
  const { accounts, addAccount, deleteAccount } = useFinance();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');

  const reset = () => {
    setName('');
    setType('checking');
    setBalance('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nom requis');
      return;
    }
    const color = ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length];
    await addAccount({
      name: name.trim(),
      type,
      balance: parseFloat(balance.replace(',', '.')) || 0,
      color,
    });
    reset();
    setModalVisible(false);
  };

  const handleDelete = (account: Account) => {
    Alert.alert('Supprimer le compte', `Supprimer "${account.name}" et toutes ses transactions ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteAccount(account.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun compte. Ajoutez-en un !</Text>}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => handleDelete(item)} style={styles.card}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{TYPE_LABELS[item.type]}</Text>
            </View>
            <Text style={styles.cardBalance}>{item.balance.toFixed(2)} €</Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau compte</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du compte"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.typeRow}>
              {(Object.keys(TYPE_LABELS) as AccountType[]).map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {TYPE_LABELS[t]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Solde initial"
              keyboardType="numeric"
              value={balance}
              onChangeText={setBalance}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  reset();
                  setModalVisible(false);
                }}
              >
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardTitle: { fontWeight: '600', fontSize: 16 },
  cardSubtitle: { color: '#64748b', fontSize: 12, marginTop: 2 },
  cardBalance: { fontWeight: '700', fontSize: 16 },
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
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
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
