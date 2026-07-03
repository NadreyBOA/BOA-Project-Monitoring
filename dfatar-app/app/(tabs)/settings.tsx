import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ShieldCheck, Cloud, Bell, Crown, Lock, Briefcase, User } from 'lucide-react-native';
import { getProfile, setSetting, SETTINGS_KEYS, getReminderOffsetDays, setReminderOffsetDays, type Profile } from '../../src/db/settings';
import { totalDue } from '../../src/db/customers';
import { getCurrentSpace, renameSpace, type Space } from '../../src/db/spaces';
import { isPremium, PREMIUM_PRICE_LABEL } from '../../src/premium';
import { CurrencyPicker } from '../../src/components/CurrencyPicker';
import { CodeBadge } from '../../src/components/CodeBadge';
import { currencyInfo } from '../../src/data/currencies';
import { PALETTES } from '../../src/theme/palettes';
import { useTheme } from '../../src/theme/ThemeContext';
import { radius, spacing, fontSize, colors as ColorsType } from '../../src/utils/theme';
import { formatAmount } from '../../src/utils/currency';
import {
  getNotificationPermissionGranted,
  requestNotificationPermission,
  sendTestReminderNotification,
} from '../../src/notifications';

const REMINDER_OFFSETS = [
  { value: 7, label: '1 semaine avant' },
  { value: 1, label: '1 jour avant' },
  { value: 0, label: "Le jour de l'échéance" },
  { value: -1, label: 'Après l\'échéance' },
];

export default function SettingsScreen() {
  const { colors, themeId, setThemeId } = useTheme();
  const styles = createStyles(colors);
  const db = useSQLiteContext();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [premium, setPremium] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reminderOffsetDays, setReminderOffsetDaysState] = useState(1);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [profileRow, space, premiumFlag, notifGranted, offsetDays] = await Promise.all([
          getProfile(db),
          getCurrentSpace(db),
          isPremium(db),
          getNotificationPermissionGranted(),
          getReminderOffsetDays(db),
        ]);
        setProfile(profileRow);
        setCurrentSpace(space);
        setDisplayName(space?.name ?? '');
        setPremium(premiumFlag);
        setNotificationsOn(notifGranted);
        setReminderOffsetDaysState(offsetDays);
      })();
    }, [db])
  );

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  async function persistDisplayName() {
    if (!currentSpace) return;
    const value = displayName.trim() || currentSpace.name;
    await renameSpace(db, currentSpace.id, value);
    setCurrentSpace({ ...currentSpace, name: value });
    flashSaved();
  }

  async function changeBaseCurrency(code: string) {
    if (!profile) return;
    await setSetting(db, SETTINGS_KEYS.baseCurrency, code);
    setProfile({ ...profile, baseCurrency: code });
    setPickerOpen(false);
    flashSaved();
  }

  async function handleThemeTap(id: string, free: boolean) {
    if (!free && !premium) {
      router.push('/paywall');
      return;
    }
    await setThemeId(id);
  }

  async function handleNotificationToggle() {
    if (!notificationsOn) {
      const granted = await requestNotificationPermission();
      setNotificationsOn(granted);
      if (!granted) {
        Alert.alert('Notifications désactivées', "Autorisez les notifications dans les réglages de votre téléphone pour activer les rappels.");
      }
      return;
    }
    setNotificationsOn(false);
  }

  async function handleTestNotification() {
    if (!currentSpace) return;
    const due = await totalDue(db, currentSpace.id);
    const text = due <= 0 ? 'Aucun montant à encaisser pour le moment.' : `Vous avez ${formatAmount(due, profile?.baseCurrency ?? 'MAD')} à encaisser.`;
    await sendTestReminderNotification(text);
  }

  async function changeReminderOffset(days: number) {
    setReminderOffsetDaysState(days);
    await setReminderOffsetDays(db, days);
  }

  function handleReviewOnboarding() {
    router.push('/onboarding?review=1');
  }

  function handleCloudPress() {
    if (!premium) router.push('/paywall');
  }

  if (!profile || !currentSpace) return <View style={styles.container} />;

  const isPro = currentSpace.accountType === 'pro';
  const base = currencyInfo(profile.baseCurrency);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionDivider}>Profil — {currentSpace.name}</Text>
      <View style={styles.typeBadgeRow}>
        {isPro ? <Briefcase color={colors.text} size={16} /> : <User color={colors.text} size={16} />}
        <Text style={styles.typeBadgeText}>{isPro ? 'Professionnel' : 'Particulier'}</Text>
        <Lock color={colors.textMuted} size={13} />
      </View>
      <Text style={styles.hint}>Le type de cet espace a été fixé à sa création et ne peut plus changer.</Text>

      <Text style={[styles.label, { marginTop: spacing.md }]}>{isPro ? "Nom de l'entreprise" : 'Votre nom'}</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        onEndEditing={persistDisplayName}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <Pressable style={styles.ghostBtn} onPress={handleReviewOnboarding}>
        <Text style={styles.ghostBtnText}>↺ Revoir l'onboarding</Text>
      </Pressable>

      <Text style={styles.sectionDivider}>Devise</Text>
      <Pressable style={[styles.picker, styles.pickerRow]} onPress={() => setPickerOpen(true)}>
        <CodeBadge code={base.code} />
        <Text style={styles.pickerText}>{base.label}</Text>
      </Pressable>
      <Text style={styles.hint}>Tous les montants de l'app sont affichés dans cette devise.</Text>
      {saved && <Text style={styles.savedText}>Enregistré</Text>}

      <Text style={styles.sectionDivider}>Thème</Text>
      <View style={styles.themeGrid}>
        {PALETTES.map((p) => {
          const locked = !p.free && !premium;
          const selected = themeId === p.id;
          return (
            <Pressable key={p.id} style={styles.themeSwatch} onPress={() => handleThemeTap(p.id, p.free)}>
              <View style={[styles.themeDot, { backgroundColor: p.primary }, selected && styles.themeDotSelected]}>
                {locked && (
                  <View style={styles.themeLock}>
                    <Lock color="#fff" size={10} />
                  </View>
                )}
              </View>
              <Text style={styles.themeName}>{p.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionDivider}>Notifications</Text>
      <View style={styles.settingsRow}>
        <Bell color={colors.primary} size={18} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>Rappels des montants dus</Text>
          <Text style={styles.rowDesc}>Une notification quotidienne du total à encaisser.</Text>
        </View>
        <Pressable style={[styles.switchTrack, notificationsOn && styles.switchTrackOn]} onPress={handleNotificationToggle}>
          <View style={[styles.switchKnob, notificationsOn && styles.switchKnobOn]} />
        </Pressable>
      </View>
      {notificationsOn && (
        <Pressable style={styles.ghostBtn} onPress={handleTestNotification}>
          <Text style={styles.ghostBtnText}>Tester la notification maintenant</Text>
        </Pressable>
      )}

      <Text style={styles.label}>Quand recevoir le rappel d'une échéance ?</Text>
      <Text style={styles.hint}>
        S'applique par défaut à toutes les dettes avec une échéance prévue, pour ne pas vous spammer.
      </Text>
      <View style={styles.chipsRow}>
        {REMINDER_OFFSETS.map((o) => {
          const active = reminderOffsetDays === o.value;
          return (
            <Pressable
              key={o.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => changeReminderOffset(o.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionDivider}>Compte</Text>
      <Pressable style={styles.settingsRow} onPress={handleCloudPress}>
        <Cloud color={colors.primary} size={18} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>Sauvegarde en ligne</Text>
          <Text style={styles.rowDesc}>
            {premium ? 'Bientôt disponible dans une prochaine mise à jour.' : 'Protégez vos données même si vous perdez votre téléphone.'}
          </Text>
        </View>
        {!premium && (
          <View style={styles.lockBadge}>
            <Lock color="#B8862E" size={12} />
          </View>
        )}
      </Pressable>

      {premium ? (
        <View style={styles.premiumActive}>
          <Crown color={colors.primary} size={16} />
          <Text style={styles.premiumActiveText}>Premium actif</Text>
        </View>
      ) : (
        <View style={styles.premiumCard}>
          <View style={styles.premiumCardTitle}>
            <Crown color="#B8862E" size={18} />
            <Text style={styles.premiumCardTitleText}>Passer à Premium</Text>
          </View>
          <Bullet text="Personnes illimitées" colors={colors} />
          <Bullet text="Sauvegarde en ligne" colors={colors} />
          <Bullet text="Tous les thèmes" colors={colors} />
          <Pressable style={styles.priceBtn} onPress={() => router.push('/paywall')}>
            <Text style={styles.priceBtnText}>Débloquer — {PREMIUM_PRICE_LABEL}</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.privacyCard}>
        <ShieldCheck color={colors.primary} size={20} />
        <Text style={styles.privacyText}>
          Vos données (personnes, transactions) restent stockées uniquement sur cet appareil, sauf si vous activez
          la sauvegarde en ligne.
        </Text>
      </View>

      <CurrencyPicker
        visible={pickerOpen}
        title="Devise de base"
        onClose={() => setPickerOpen(false)}
        onSelect={changeBaseCurrency}
      />
    </ScrollView>
  );
}

function Bullet({ text, colors }: { text: string; colors: typeof ColorsType }) {
  return (
    <Text style={{ fontSize: fontSize.xs, color: colors.text, marginBottom: 4 }}>
      <Text style={{ color: '#B8862E', fontWeight: '700' }}>✓ </Text>
      {text}
    </Text>
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
    sectionDivider: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.textMuted,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    typeBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      alignSelf: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 3,
    },
    typeBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.text,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
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
    picker: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    pickerText: {
      fontSize: fontSize.md,
      color: colors.text,
    },
    hint: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    savedText: {
      marginTop: spacing.sm,
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    themeSwatch: {
      alignItems: 'center',
      gap: 6,
      width: 68,
    },
    themeDot: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      borderWidth: 2.5,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeDotSelected: {
      borderColor: colors.text,
    },
    themeLock: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#B8862E',
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeName: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.textMuted,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.md,
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
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    rowTitle: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    rowDesc: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    switchTrack: {
      width: 40,
      height: 24,
      borderRadius: radius.full,
      backgroundColor: colors.border,
      padding: 3,
    },
    switchTrackOn: {
      backgroundColor: colors.primary,
    },
    switchKnob: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#fff',
    },
    switchKnobOn: {
      transform: [{ translateX: 16 }],
    },
    ghostBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 4,
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    ghostBtnText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textMuted,
    },
    lockBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#F7EFDD',
      alignItems: 'center',
      justifyContent: 'center',
    },
    premiumActive: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primaryMuted,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    premiumActiveText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: fontSize.sm,
    },
    premiumCard: {
      backgroundColor: '#F7EFDD',
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    premiumCardTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: spacing.sm,
    },
    premiumCardTitleText: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    priceBtn: {
      backgroundColor: '#B8862E',
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 4,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    priceBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: fontSize.sm,
    },
    privacyCard: {
      flexDirection: 'row',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.xl,
      alignItems: 'flex-start',
    },
    privacyText: {
      flex: 1,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      lineHeight: 18,
    },
  });
}
