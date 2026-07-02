import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { createTransaction } from '../../src/db/transactions';
import { getCustomer } from '../../src/db/customers';
import type { TransactionType } from '../../src/types';
import { radius, spacing, fontSize, colors as ColorsType } from '../../src/utils/theme';
import { useTheme } from '../../src/theme/ThemeContext';
import { formatDate } from '../../src/utils/currency';

export default function TransactionFormScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { customerId, type: initialType } = useLocalSearchParams<{ customerId: string; type?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [type, setType] = useState<TransactionType>(initialType === 'payment' ? 'payment' : 'credit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    if (!customerId) return;
    getCustomer(db, customerId).then((c) => setCurrency(c?.currency ?? ''));
  }, [db, customerId]);

  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const canSave = customerId && !Number.isNaN(parsedAmount) && parsedAmount > 0 && !saving;

  async function handleSave() {
    if (!canSave || !customerId) return;
    setSaving(true);
    try {
      await createTransaction(db, {
        customerId,
        type,
        amount: parsedAmount,
        date: new Date().toISOString(),
        note: note || null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: currency ? `Nouvelle transaction (${currency})` : 'Nouvelle transaction' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.segmented}>
          <Pressable
            style={[styles.segment, type === 'credit' && styles.segmentActiveCredit]}
            onPress={() => setType('credit')}
          >
            <Text style={[styles.segmentText, type === 'credit' && styles.segmentTextActive]}>Dette</Text>
          </Pressable>
          <Pressable
            style={[styles.segment, type === 'payment' && styles.segmentActivePayment]}
            onPress={() => setType('payment')}
          >
            <Text style={[styles.segmentText, type === 'payment' && styles.segmentTextActive]}>Remboursement</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Montant *</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          style={styles.input}
          autoFocus
        />

        <Text style={styles.label}>Date</Text>
        <Text style={styles.dateText}>{formatDate(new Date().toISOString())} (aujourd'hui)</Text>

        <Text style={styles.label}>Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ex: sac de riz, dépannage..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.multiline]}
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: typeof ColorsType) {
  return StyleSheet.create({
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
    segmented: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    segment: {
      flex: 1,
      paddingVertical: spacing.sm + 4,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    segmentActiveCredit: {
      backgroundColor: colors.dangerMuted,
      borderColor: colors.danger,
    },
    segmentActivePayment: {
      backgroundColor: colors.primaryMuted,
      borderColor: colors.primary,
    },
    segmentText: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.textMuted,
    },
    segmentTextActive: {
      color: colors.text,
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
    multiline: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    dateText: {
      fontSize: fontSize.md,
      color: colors.text,
      paddingVertical: spacing.sm,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: fontSize.md,
    },
  });
}
