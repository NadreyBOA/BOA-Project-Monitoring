import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Check, X } from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { purchasePremium, restorePremium, isRevenueCatConfigured, FREE_CUSTOMER_LIMIT, PREMIUM_PRICE_LABEL } from '../src/premium';

const FEATURES = [
  `Personnes illimitées (au-delà de ${FREE_CUSTOMER_LIMIT})`,
  "Sauvegarde en ligne sur tous vos appareils",
  'Tous les thèmes de personnalisation',
  'Toutes les futures mises à jour incluses',
];

export default function PaywallScreen() {
  const { fromLimit } = useLocalSearchParams<{ fromLimit?: string }>();
  const { colors, spacing, radius, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setBusy(true);
    setError(null);
    try {
      const result = await purchasePremium(db);
      if (result.success) {
        router.replace('/backup-auth?justUnlocked=1');
      } else if (!result.cancelled) {
        setError(result.error ?? "L'achat n'a pas pu être finalisé.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    setBusy(true);
    setError(null);
    try {
      const result = await restorePremium(db);
      if (result.success) {
        router.back();
      } else {
        setError(result.error ?? 'Aucun achat à restaurer sur ce compte.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.lg + insets.bottom }}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Fermer" style={styles.closeBtn}>
          <X color={colors.textMuted} size={22} />
        </Pressable>

        <View style={styles.hero}>
          <Image source={require('../assets/icon.png')} style={styles.appIcon} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>Débloquez tout Bankee</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            {fromLimit
              ? `Vous avez atteint la limite de ${FREE_CUSTOMER_LIMIT} personnes en version gratuite.`
              : 'Un seul paiement. À vie. Aucun abonnement.'}
          </Text>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Check color={colors.primary} size={18} strokeWidth={2.5} />
              <Text style={[styles.featureText, { color: colors.text, fontSize: fontSize.sm }]}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.priceCard, { borderColor: colors.primary, backgroundColor: colors.primaryMuted, borderRadius: radius.lg }]}>
          <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Accès à vie</Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>{PREMIUM_PRICE_LABEL}</Text>
          <Text style={[styles.priceSub, { color: colors.textMuted }]}>Paiement unique, aucun renouvellement</Text>
        </View>

        {!isRevenueCatConfigured && (
          <View style={[styles.warnBox, { backgroundColor: colors.dangerMuted, borderRadius: radius.md }]}>
            <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>
              Le paiement n'est pas encore configuré pour cette build (clé RevenueCat manquante).
            </Text>
          </View>
        )}

        {error && <Text style={[styles.note, { color: colors.danger }]}>{error}</Text>}

        <Pressable
          style={[styles.ctaBtn, { backgroundColor: colors.primary, borderRadius: radius.md, opacity: busy ? 0.6 : 1 }]}
          onPress={handleUnlock}
          disabled={busy}
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Débloquer maintenant</Text>}
        </Pressable>

        <View style={styles.footerLinks}>
          <Pressable onPress={handleRestore} disabled={busy}>
            <Text style={[styles.footerLinkText, { color: colors.textMuted }]}>Restaurer les achats</Text>
          </Pressable>
          <Text style={[styles.footerDot, { color: colors.textMuted }]}>·</Text>
          <Text style={[styles.footerLinkText, { color: colors.textMuted }]}>Conditions</Text>
          <Text style={[styles.footerDot, { color: colors.textMuted }]}>·</Text>
          <Text style={[styles.footerLinkText, { color: colors.textMuted }]}>Confidentialité</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: { alignSelf: 'flex-end', padding: 4, marginBottom: 4 },
  hero: { alignItems: 'center', paddingBottom: 20 },
  appIcon: { width: 72, height: 72, borderRadius: 18, marginBottom: 14 },
  heroTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { fontSize: 13.5, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8 },
  featureCard: { padding: 6, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 10 },
  featureText: { flex: 1, fontWeight: '600' },
  priceCard: { borderWidth: 1.5, padding: 18, alignItems: 'center', marginBottom: 16 },
  priceLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  priceValue: { fontSize: 34, fontWeight: '800', marginBottom: 4 },
  priceSub: { fontSize: 12.5 },
  warnBox: { padding: 12, marginBottom: 12 },
  note: { textAlign: 'center', fontSize: 12, marginBottom: 12 },
  ctaBtn: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 },
  footerLinkText: { fontSize: 12, fontWeight: '600' },
  footerDot: { fontSize: 12 },
});
