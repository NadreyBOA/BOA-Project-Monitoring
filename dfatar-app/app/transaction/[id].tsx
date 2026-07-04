import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { X } from 'lucide-react-native';
import {
  getTransaction,
  listTransactionEdits,
  updateTransactionAmount,
  updateTransactionDueDate,
  updateTransactionDate,
  updateTransactionChannel,
  updateTransactionNote,
} from '../../src/db/transactions';
import { getCustomerWithBalance } from '../../src/db/customers';
import { getProfile } from '../../src/db/settings';
import { PAYMENT_CHANNELS } from '../../src/data/paymentChannels';
import { DateField } from '../../src/components/DateField';
import { TimeField } from '../../src/components/TimeField';
import type { Transaction, TransactionEdit } from '../../src/types';
import { radius, spacing, fontSize, colors as ColorsType } from '../../src/utils/theme';
import { useTheme } from '../../src/theme/ThemeContext';
import { formatAmount, formatDate } from '../../src/utils/currency';

const DUE_DATE_REASONS = ['À la demande du débiteur', 'Entente mutuelle', 'Erreur de saisie', 'Autre'];

const FIELD_LABELS: Record<string, string> = {
  amount: 'Montant',
  due_date: 'Échéance',
  date: 'Date',
  channel: 'Canal',
  note: 'Note',
};

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function displayValue(field: string, value: string | null): string {
  if (value === null) return '—';
  if (field === 'due_date' || field === 'date') return formatDate(value);
  return value;
}

export default function TransactionDetailScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [edits, setEdits] = useState<TransactionEdit[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<number | null>(null);

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('');
  const [channel, setChannel] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState<string | null>(null);
  const [reasonOther, setReasonOther] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [tx, editRows, profile] = await Promise.all([getTransaction(db, id), listTransactionEdits(db, id), getProfile(db)]);
    setTransaction(tx);
    setEdits(editRows);
    setCurrency(profile.baseCurrency);
    setAmount(tx ? String(tx.amount) : '');
    setDueDate(tx?.due_date ?? '');
    setDatePart(tx ? tx.date.slice(0, 10) : '');
    setTimePart(tx && tx.date.length > 15 ? tx.date.slice(11, 16) : '00:00');
    setChannel(tx?.payment_channel ?? null);
    setNote(tx?.note ?? '');
    if (tx && tx.type === 'payment') {
      const customer = await getCustomerWithBalance(db, tx.customer_id);
      setMaxPaymentAmount(customer ? customer.balance + tx.amount : null);
    } else {
      setMaxPaymentAmount(null);
    }
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Transaction' }} />
      </View>
    );
  }

  const isCredit = transaction.type === 'credit';
  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const amountChanged = !Number.isNaN(parsedAmount) && parsedAmount !== transaction.amount;
  const amountValid =
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    (maxPaymentAmount === null || parsedAmount <= maxPaymentAmount);

  const trimmedDueDate = dueDate.trim();
  const dueDateChanged = isCredit && trimmedDueDate !== (transaction.due_date ?? '');
  const dueDateValid = !isCredit || isValidDate(trimmedDueDate);
  const reasonValid = !dueDateChanged || (reason !== null && (reason !== 'Autre' || reasonOther.trim().length > 0));

  const datePartValid = isValidDate(datePart.trim());
  const timePartValid = !isCredit || isValidTime(timePart.trim());
  const newDate = `${datePart.trim()}T${(isCredit ? timePart.trim() : '00:00') || '00:00'}:00`;
  const dateChanged = newDate !== transaction.date;
  const channelChanged = (channel || null) !== (transaction.payment_channel || null);
  const noteChanged = (note.trim() || null) !== (transaction.note || null);

  const canSave =
    amountValid &&
    dueDateValid &&
    reasonValid &&
    datePartValid &&
    timePartValid &&
    (amountChanged || dueDateChanged || dateChanged || channelChanged || noteChanged) &&
    !saving;

  async function handleSave() {
    if (!canSave || !transaction) return;
    setSaving(true);
    try {
      if (amountChanged) {
        await updateTransactionAmount(db, transaction, parsedAmount);
      }
      if (dueDateChanged) {
        await updateTransactionDueDate(db, transaction, trimmedDueDate || null, reason ?? 'Autre', reason === 'Autre' ? reasonOther.trim() : null);
      }
      if (dateChanged) {
        await updateTransactionDate(db, transaction, newDate);
      }
      if (channelChanged) {
        await updateTransactionChannel(db, transaction, channel);
      }
      if (noteChanged) {
        await updateTransactionNote(db, transaction, note);
      }
      setReason(null);
      setReasonOther('');
      await load();
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : insets.top}
    >
      <Stack.Screen
        options={{
          title: isCredit ? 'Dette' : 'Remboursement',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Fermer">
              <X color={colors.text} size={22} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Montant</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={[styles.input, !amountValid && styles.inputError]}
        />
        {!amountValid && maxPaymentAmount !== null && (
          <Text style={styles.errorText}>
            Le remboursement ne peut pas dépasser le solde dû ({formatAmount(maxPaymentAmount, currency)}).
          </Text>
        )}

        {isCredit && (
          <>
            <Text style={styles.label}>Échéance</Text>
            <DateField value={dueDate} onChange={setDueDate} error={!dueDateValid} />
            {!dueDateValid && <Text style={styles.errorText}>Format attendu : AAAA-MM-JJ</Text>}

            {dueDateChanged && (
              <>
                <Text style={styles.label}>Motif de la modification *</Text>
                <View style={styles.chipsRow}>
                  {DUE_DATE_REASONS.map((r) => (
                    <Pressable
                      key={r}
                      style={[styles.chip, reason === r && styles.chipActive]}
                      onPress={() => setReason(r)}
                    >
                      <Text style={[styles.chipText, reason === r && styles.chipTextActive]}>{r}</Text>
                    </Pressable>
                  ))}
                </View>
                {reason === 'Autre' && (
                  <TextInput
                    value={reasonOther}
                    onChangeText={setReasonOther}
                    placeholder="Précisez le motif"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { marginTop: spacing.sm }]}
                  />
                )}
              </>
            )}
          </>
        )}

        <View style={styles.row}>
          <View style={styles.rowField}>
            <Text style={styles.label}>{isCredit ? 'Date de prise du crédit' : 'Date du remboursement'}</Text>
            <DateField value={datePart} onChange={setDatePart} error={!datePartValid} />
          </View>
          {isCredit && (
            <View style={styles.rowField}>
              <Text style={styles.label}>Heure</Text>
              <TimeField value={timePart} onChange={setTimePart} error={!timePartValid} />
            </View>
          )}
        </View>
        {(!datePartValid || !timePartValid) && (
          <Text style={styles.errorText}>Format attendu : AAAA-MM-JJ{isCredit ? ' et HH:MM' : ''}</Text>
        )}

        <Text style={styles.label}>Canal (facultatif)</Text>
        <View style={styles.chipsRow}>
          {PAYMENT_CHANNELS.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, channel === c && styles.chipActive]}
              onPress={() => setChannel(channel === c ? null : c)}
            >
              <Text style={[styles.chipText, channel === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ex: sac de riz, dépannage..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.multiline]}
          multiline
        />

        <Text style={styles.sectionTitle}>Historique des modifications</Text>
        {edits.length === 0 ? (
          <Text style={styles.hint}>Aucune modification apportée à cette transaction.</Text>
        ) : (
          edits.map((e) => (
            <View key={e.id} style={styles.editRow}>
              <Text style={styles.editField}>{FIELD_LABELS[e.field] ?? e.field}</Text>
              <Text style={styles.editChange}>
                {displayValue(e.field, e.old_value)} → {displayValue(e.field, e.new_value)}
              </Text>
              {!!(e.reason || e.reason_other) && (
                <Text style={styles.editReason}>Motif : {e.reason === 'Autre' ? e.reason_other : e.reason}</Text>
              )}
              <Text style={styles.editDate}>{formatDate(e.created_at)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</Text>
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
    inputError: {
      borderColor: colors.danger,
    },
    errorText: {
      fontSize: fontSize.xs,
      color: colors.danger,
      marginTop: spacing.xs,
    },
    readOnlyText: {
      fontSize: fontSize.md,
      color: colors.text,
      paddingVertical: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    rowField: {
      flex: 1,
    },
    multiline: {
      minHeight: 70,
      textAlignVertical: 'top',
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 3,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.textMuted,
    },
    chipTextActive: {
      color: '#fff',
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    hint: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    editRow: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    editField: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    editChange: {
      fontSize: fontSize.sm,
      color: colors.text,
      marginTop: 2,
    },
    editReason: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    editDate: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: 4,
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
