import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChevronRight, X } from 'lucide-react-native';
import { createCustomer, getCustomer, updateCustomer } from '../../src/db/customers';
import { createTransaction } from '../../src/db/transactions';
import { getProfile } from '../../src/db/settings';
import { CurrencyPicker } from '../../src/components/CurrencyPicker';
import { CodeBadge } from '../../src/components/CodeBadge';
import { currencyInfo } from '../../src/data/currencies';
import { radius, spacing, fontSize, colors as ColorsType } from '../../src/utils/theme';
import { useTheme } from '../../src/theme/ThemeContext';

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
  const [currency, setCurrency] = useState('MAD');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtNote, setDebtNote] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (id) {
          const customer = await getCustomer(db, id);
          if (customer) {
            setName(customer.name);
            setPhone(customer.phone ?? '');
            setAddress(customer.address ?? '');
            setNote(customer.note ?? '');
            setCurrency(customer.currency);
          }
        } else {
          const profile = await getProfile(db);
          setCurrency(profile.baseCurrency);
        }
      })();
    }, [db, id])
  );

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateCustomer(db, id, { name, phone: phone || null, address: address || null, note: note || null, currency });
        router.back();
      } else {
        const newId = await createCustomer(db, { name, phone: phone || null, address: address || null, note: note || null, currency });
        const parsedDebt = parseFloat(debtAmount.replace(',', '.'));
        if (!isNaN(parsedDebt) && parsedDebt > 0) {
          await createTransaction(db, {
            customerId: newId,
            type: 'credit',
            amount: parsedDebt,
            date: new Date().toISOString(),
            note: debtNote || null,
          });
        }
        router.replace(`/customer/${newId}`);
      }
    } finally {
      setSaving(false);
    }
  }

  const selectedCurrency = currencyInfo(currency);

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

        <Text style={styles.label}>Devise</Text>
        <Pressable style={styles.picker} onPress={() => setPickerOpen(true)}>
          <View style={styles.pickerLeft}>
            <CodeBadge code={selectedCurrency.code} />
            <Text style={styles.pickerText}>{selectedCurrency.label}</Text>
          </View>
          <ChevronRight color={colors.textMuted} size={18} />
        </Pressable>

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
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, (!name.trim() || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
        </Pressable>
      </View>

      <CurrencyPicker
        visible={pickerOpen}
        title="Devise de cette personne"
        onClose={() => setPickerOpen(false)}
        onSelect={(code) => {
          setCurrency(code);
          setPickerOpen(false);
        }}
      />
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
    hint: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    picker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
    },
    pickerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    pickerText: {
      fontSize: fontSize.md,
      color: colors.text,
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
