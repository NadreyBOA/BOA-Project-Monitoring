import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { X } from 'lucide-react-native';
import { createCustomer, getCustomer, updateCustomer } from '../../src/db/customers';
import { createTransaction } from '../../src/db/transactions';
import { getReminderOffsetDays } from '../../src/db/settings';
import { getCurrentSpaceId } from '../../src/db/spaces';
import { scheduleDebtReminder } from '../../src/notifications';
import { PAYMENT_CHANNELS } from '../../src/data/paymentChannels';
import { DateField } from '../../src/components/DateField';
import { TimeField } from '../../src/components/TimeField';
import { radius, spacing, fontSize, colors as ColorsType } from '../../src/utils/theme';
import { useTheme } from '../../src/theme/ThemeContext';

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

export default function CustomerFormScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const db = useSQLiteContext();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtNote, setDebtNote] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [creditDate, setCreditDate] = useState(todayDateInput());
  const [creditTime, setCreditTime] = useState(nowTimeInput());
  const [debtChannel, setDebtChannel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parsedDebt = parseFloat(debtAmount.replace(',', '.'));
  const hasInitialDebt = !isNaN(parsedDebt) && parsedDebt > 0;
  const trimmedDebtDueDate = debtDueDate.trim();
  const debtDueDateValid = hasInitialDebt ? isValidDate(trimmedDebtDueDate) : !trimmedDebtDueDate || isValidDate(trimmedDebtDueDate);
  const creditDateValid = !hasInitialDebt || isValidDate(creditDate.trim());
  const creditTimeValid = !hasInitialDebt || isValidTime(creditTime.trim());
  const formValid = debtDueDateValid && creditDateValid && creditTimeValid;

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      (async () => {
        const customer = await getCustomer(db, id);
        if (customer) {
          setName(customer.name);
          setPhone(customer.phone ?? '');
          setAddress(customer.address ?? '');
          setNote(customer.note ?? '');
        }
      })();
    }, [db, id])
  );

  async function handleSave() {
    if (!name.trim() || !formValid || saving) return;
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateCustomer(db, id, { name, phone: phone || null, address: address || null, note: note || null });
        router.back();
      } else {
        const spaceId = await getCurrentSpaceId(db);
        if (!spaceId) return;
        const newId = await createCustomer(db, spaceId, { name, phone: phone || null, address: address || null, note: note || null });
        if (hasInitialDebt) {
          const effectiveDueDate = trimmedDebtDueDate;
          const offsetDays = await getReminderOffsetDays(db);
          const notificationId = await scheduleDebtReminder(name, parsedDebt, effectiveDueDate, offsetDays);
          await createTransaction(db, {
            customerId: newId,
            type: 'credit',
            amount: parsedDebt,
            date: `${creditDate.trim()}T${creditTime.trim()}:00`,
            note: debtNote || null,
            dueDate: effectiveDueDate,
            notificationId,
            paymentChannel: debtChannel,
          });
        }
        router.replace(`/customer/${newId}`);
      }
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
          title: isEdit ? 'Modifier la personne' : 'Nouvelle personne',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Fermer">
              <X color={colors.text} size={22} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nom *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Alex Morgan"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoFocus={!isEdit}
        />

        <Text style={styles.label}>Contact (téléphone)</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Ex: +1 555 123 4567"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <Text style={styles.hint}>Nécessaire pour envoyer un rappel WhatsApp.</Text>

        <Text style={styles.label}>Adresse (facultatif)</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Ex: 123 Main Street"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Observation (facultatif)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ex: repère, information utile..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.multiline]}
          multiline
        />

        {!isEdit && (
          <>
            <View style={styles.divider}>
              <Text style={styles.dividerText}>Dette initiale (facultatif)</Text>
            </View>
            <Text style={styles.label}>Montant déjà dû</Text>
            <TextInput
              value={debtAmount}
              onChangeText={setDebtAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <Text style={styles.label}>Note</Text>
            <TextInput
              value={debtNote}
              onChangeText={setDebtNote}
              placeholder="Ex: sac de riz, dépannage..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <Text style={styles.label}>Échéance prévue {hasInitialDebt ? '*' : '(facultatif)'}</Text>
            <DateField value={debtDueDate} onChange={setDebtDueDate} error={!debtDueDateValid} />
            {!debtDueDateValid && (
              <Text style={styles.errorText}>
                {hasInitialDebt && !trimmedDebtDueDate ? "L'échéance est obligatoire pour une dette." : 'Format attendu : AAAA-MM-JJ'}
              </Text>
            )}

            {hasInitialDebt && (
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

                <Text style={styles.label}>Canal (facultatif)</Text>
                <View style={styles.chipsRow}>
                  {PAYMENT_CHANNELS.map((c) => (
                    <Pressable
                      key={c}
                      style={[styles.chip, debtChannel === c && styles.chipActive]}
                      onPress={() => setDebtChannel(debtChannel === c ? null : c)}
                    >
                      <Text style={[styles.chipText, debtChannel === c && styles.chipTextActive]}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
        <Pressable
          style={[styles.saveButton, (!name.trim() || !formValid || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || !formValid || saving}
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
      minHeight: 70,
      textAlignVertical: 'top',
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
    inputError: {
      borderColor: colors.danger,
    },
    errorText: {
      fontSize: fontSize.xs,
      color: colors.danger,
      marginTop: spacing.xs,
    },
    hint: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    divider: {
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
    },
    dividerText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.textMuted,
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
