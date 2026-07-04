import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { X } from 'lucide-react-native';
import { createTransaction } from '../../src/db/transactions';
import { getProfile, getReminderOffsetDays } from '../../src/db/settings';
import { getCustomer, getCustomerWithBalance } from '../../src/db/customers';
import { scheduleDebtReminder } from '../../src/notifications';
import { PAYMENT_CHANNELS } from '../../src/data/paymentChannels';
import { DateField } from '../../src/components/DateField';
import { TimeField } from '../../src/components/TimeField';
import type { TransactionType } from '../../src/types';
import { radius, spacing, fontSize, colors as ColorsType } from '../../src/utils/theme';
import { useTheme } from '../../src/theme/ThemeContext';
import { formatAmount } from '../../src/utils/currency';

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeInput(): string {
  return new Date().toTimeString().slice(0, 5);
}

export default function TransactionFormScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { customerId, type: initialType } = useLocalSearchParams<{ customerId: string; type?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [type, setType] = useState<TransactionType>(initialType === 'payment' ? 'payment' : 'credit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [creditDate, setCreditDate] = useState(todayDateInput());
  const [creditTime, setCreditTime] = useState(nowTimeInput());
  const [paymentDate, setPaymentDate] = useState(todayDateInput());
  const [paymentChannel, setPaymentChannel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState('');
  const [customerBalance, setCustomerBalance] = useState<number | null>(null);

  useEffect(() => {
    getProfile(db).then((p) => setCurrency(p.baseCurrency));
  }, [db]);

  useEffect(() => {
    if (!customerId) return;
    getCustomerWithBalance(db, customerId).then((c) => setCustomerBalance(c?.balance ?? null));
  }, [db, customerId]);

  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const amountEntered = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const exceedsBalance =
    type === 'payment' && amountEntered && customerBalance !== null && parsedAmount > customerBalance;

  const trimmedDueDate = dueDate.trim();
  const dueDateValid = type !== 'credit' || isValidDate(trimmedDueDate);
  const creditDateValid = type !== 'credit' || isValidDate(creditDate.trim());
  const creditTimeValid = type !== 'credit' || isValidTime(creditTime.trim());
  const paymentDateValid = type !== 'payment' || isValidDate(paymentDate.trim());

  const canSave =
    customerId &&
    amountEntered &&
    !exceedsBalance &&
    dueDateValid &&
    creditDateValid &&
    creditTimeValid &&
    paymentDateValid &&
    !saving;

  async function handleSave() {
    if (!canSave || !customerId) return;
    setSaving(true);
    try {
      const effectiveDueDate = type === 'credit' ? trimmedDueDate : null;
      let notificationId: string | null = null;
      if (effectiveDueDate) {
        const [customer, offsetDays] = await Promise.all([
          getCustomer(db, customerId),
          getReminderOffsetDays(db),
        ]);
        notificationId = await scheduleDebtReminder(
          customer?.name ?? '',
          parsedAmount,
          effectiveDueDate,
          offsetDays
        );
      }
      const date =
        type === 'credit'
          ? `${creditDate.trim()}T${creditTime.trim()}:00`
          : `${paymentDate.trim()}T00:00:00`;
      await createTransaction(db, {
        customerId,
        type,
        amount: parsedAmount,
        date,
        note: note || null,
        dueDate: effectiveDueDate,
        notificationId,
        paymentChannel,
      });
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
          title: currency ? `Nouvelle transaction (${currency})` : 'Nouvelle transaction',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Fermer">
              <X color={colors.text} size={22} />
            </Pressable>
          ),
        }}
      />
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
          style={[styles.input, exceedsBalance && styles.inputError]}
          autoFocus
        />
        {exceedsBalance && customerBalance !== null && (
          <Text style={styles.errorText}>
            Le remboursement ne peut pas dépasser le solde dû ({formatAmount(customerBalance, currency)}).
          </Text>
        )}

        {type === 'credit' ? (
          <>
            <Text style={styles.label}>Date de prise du crédit</Text>
            <View style={styles.row}>
              <View style={styles.rowInput}>
                <DateField value={creditDate} onChange={setCreditDate} error={!creditDateValid} />
              </View>
              <View style={styles.rowInput}>
                <TimeField value={creditTime} onChange={setCreditTime} error={!creditTimeValid} />
              </View>
            </View>

            <Text style={styles.label}>Échéance prévue *</Text>
            <DateField value={dueDate} onChange={setDueDate} error={!dueDateValid} />
            {!dueDateValid && (
              <Text style={styles.errorText}>
                {trimmedDueDate ? 'Format attendu : AAAA-MM-JJ' : "L'échéance est obligatoire pour une dette."}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.label}>Date du remboursement</Text>
            <DateField value={paymentDate} onChange={setPaymentDate} error={!paymentDateValid} />
          </>
        )}

        <Text style={styles.label}>Canal (facultatif)</Text>
        <View style={styles.chipsRow}>
          {PAYMENT_CHANNELS.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, paymentChannel === c && styles.chipActive]}
              onPress={() => setPaymentChannel(paymentChannel === c ? null : c)}
            >
              <Text style={[styles.chipText, paymentChannel === c && styles.chipTextActive]}>{c}</Text>
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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
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
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    rowInput: {
      flex: 1,
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
    inputError: {
      borderColor: colors.danger,
    },
    errorText: {
      fontSize: fontSize.xs,
      color: colors.danger,
      marginTop: spacing.xs,
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
