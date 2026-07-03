import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Cloud, X } from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { signInCloud, signUpCloud } from '../src/cloud/auth';
import { cloudHasData, hasLocalData, pullAllFromCloud, pushAllToCloud } from '../src/cloud/sync';
import { isCloudBackupConfigured } from '../src/cloud/supabase';

type Mode = 'signIn' | 'signUp';

export default function BackupAuthScreen() {
  const { colors, spacing, radius, fontSize } = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = emailValid && password.length >= 6 && !busy;

  async function finishWithUser(userId: string) {
    const [localHasData, remoteHasData] = await Promise.all([hasLocalData(db), cloudHasData(userId)]);
    if (!localHasData && remoteHasData) {
      await pullAllFromCloud(db, userId);
      setInfo('Vos données ont été restaurées depuis la sauvegarde en ligne.');
    } else {
      await pushAllToCloud(db, userId);
      setInfo('Sauvegarde effectuée.');
    }
    setTimeout(() => router.back(), 900);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'signUp') {
        const result = await signUpCloud(email, password);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.needsEmailConfirmation) {
          setInfo("Compte créé. Vérifiez votre email pour confirmer votre compte, puis connectez-vous.");
          setMode('signIn');
          return;
        }
        if (result.userId) await finishWithUser(result.userId);
      } else {
        const result = await signInCloud(email, password);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.userId) await finishWithUser(result.userId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Sauvegarde en ligne',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Fermer">
              <X color={colors.text} size={22} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {!isCloudBackupConfigured && (
          <View style={[styles.warnBox, { backgroundColor: colors.dangerMuted, borderRadius: radius.md, marginBottom: spacing.md }]}>
            <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>
              La sauvegarde en ligne n'est pas encore configurée pour cette build (clé Supabase manquante).
            </Text>
          </View>
        )}

        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primaryMuted }]}>
            <Cloud color={colors.primary} size={26} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {mode === 'signIn' ? 'Connexion' : 'Créer un compte'}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            Vos données seront sauvegardées et disponibles sur n'importe quel appareil.
          </Text>
        </View>

        <View style={[styles.tabs, { borderColor: colors.border, borderRadius: radius.md }]}>
          <Pressable
            style={[styles.tab, mode === 'signIn' && { backgroundColor: colors.primary }]}
            onPress={() => { setMode('signIn'); setError(null); setInfo(null); }}
          >
            <Text style={[styles.tabText, { color: mode === 'signIn' ? '#fff' : colors.textMuted }]}>Se connecter</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, mode === 'signUp' && { backgroundColor: colors.primary }]}
            onPress={() => { setMode('signUp'); setError(null); setInfo(null); }}
          >
            <Text style={[styles.tabText, { color: mode === 'signUp' ? '#fff' : colors.textMuted }]}>Créer un compte</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="vous@exemple.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Mot de passe</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="6 caractères minimum"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md }]}
        />

        {error && <Text style={[styles.message, { color: colors.danger }]}>{error}</Text>}
        {info && <Text style={[styles.message, { color: colors.primary }]}>{info}</Text>}

        <Pressable
          style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: radius.md, opacity: canSubmit ? 1 : 0.5 }]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {busy ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.submitBtnText}>{mode === 'signIn' ? 'Se connecter' : 'Créer le compte'}</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { alignItems: 'center', paddingVertical: 12 },
  heroIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  heroSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8 },
  tabs: { flexDirection: 'row', borderWidth: 1, padding: 3, marginTop: 8, marginBottom: 18 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  tabText: { fontSize: 13, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 },
  message: { fontSize: 12.5, marginTop: 12, lineHeight: 18 },
  warnBox: { padding: 12 },
  submitBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
