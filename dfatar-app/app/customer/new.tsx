import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { X } from 'lucide-react-native';
import { createCustomer, getCustomer, updateCustomer } from '../../src/db/customers';
import { createTransaction } from '../../src/db/transactions';
import { getReminderOffsetDays } from '../../src/db/settings';
import { scheduleDebtReminder } from '../../src/notifications';
import { radius, spacing, fontSize, colors as ColorsType } from '../../src/utils/theme';
import { useTheme } from '../../src/theme/ThemeContext';

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default function CustomerFormScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
  const [saving, setSaving] = useState(false);

  const trimmedDebtDueDate = debtDueDate.trim();
  const debtDueDateValid = !trimmedDebtDueDate || isValidDate(trimmedDebtDueDate);

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
    if (!name.trim() || !debtDueDateValid || saving) return;
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateCustomer(db, id, { name, phone: phone || null, address: address || null, note: note || null });
        router.back();
      } else {
        const newId = await createCustomer(db, { name, phone: phone || null, address: address || null, note: note || null });
        const parsedDebt = parseFloat(debtAmount.replace(',', '.'));
        if (!isNaN(parsedDebt) && parsedDebt > 0) {
          const effectiveDueDate = debtDueDateValid && trimmedDebtDueDate ? trimmedDebtDueDate : null;
          let notificationId: string | null = null;
          if (effectiveDueDate) {
            const offsetDays = await getReminderOffsetDays(db);
            notificationId = await scheduleDebtReminder(name, parsedDebt, effectiveDueDate, offsetDays);
          }
          await createTransaction(db, {
            customerId: newId,
            type: 'credit',
            amount: parsedDebt,
            date: new Date().toISOString(),
            note: debtNote || null,
            dueDate: effectiveDueDate,
            notificationId,
          });
        }
        router.replace(`/customer/${newId}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          placeholder="Ex: Ahmed Benali"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoFocus={!isEdit}
        />

        <Text style={styles.label}>Contact (téléphone)</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Ex: 0612345678"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <Text style={styles.hint}>Nécessaire pour envoyer un rappel WhatsApp.</Text>

        <Text style={styles.label}>Adresse (facultatif)</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Ex: Quartier Maarif, Casablanca"
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
            <Text style={styles.label}>Échéance prévue (facultatif)</Text>
            <TextInput
              value={debtDueDate}
              onChangeText={setDebtDueDate}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, !debtDueDateValid && styles.inputError]}
            />
            {!debtDueDateValid && <Text style={styles.errorText}>Format attendu : AAAA-MM-JJ</Text>}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, (!name.trim() || !debtDueDateValid || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || !debtDueDateValid || saving}
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
