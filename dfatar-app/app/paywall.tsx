import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { X } from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { purchasePremium, restorePremium, isRevenueCatConfigured, FREE_CUSTOMER_LIMIT, PREMIUM_PRICE_LABEL } from '../src/premium';

const FEATURES = [
  { emoji: '♾️', bg: '#E6E9FE', title: 'Personnes illimitées', desc: `Plus de limite de ${FREE_CUSTOMER_LIMIT} personnes suivies.` },
  { emoji: '☁️', bg: '#FCE7F3', title: 'Sauvegarde en ligne', desc: "Vos données en sécurité sur tous vos appareils." },
  { emoji: '🎨', bg: '#FEF0DB', title: 'Thèmes de personnalisation', desc: "Changez les couleurs de l'app selon vos goûts." },
  { emoji: '✨', bg: '#DBF5EE', title: 'Mises à jour incluses', desc: 'Toutes les futures fonctionnalités, sans frais.' },
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
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: spacing.lg + insets.bottom }}>
        <LinearGradient
          colors={[colors.primary, '#0E6E44']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}
        >
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Fermer" style={styles.closeBtn}>
            <X color="#fff" size={22} />
          </Pressable>
          <Text style={styles.sparkleTL}>✨</Text>
          <Text style={styles.sparkleTR}>💸</Text>
          <Text style={styles.sparkleBL}>🎉</Text>
          <View style={styles.appIconWrap}>
            <Image source={require('../assets/icon.png')} style={styles.appIcon} />
          </View>
          <Text style={styles.heroTitle}>Débloquez tout Bankee</Text>
          <Text style={styles.heroSubtitle}>
            {fromLimit
              ? `Vous avez atteint la limite de ${FREE_CUSTOMER_LIMIT} personnes en version gratuite.`
              : 'Un seul paiement. À vie. Aucun abonnement.'}
          </Text>
        </LinearGradient>

        <View style={{ padding: spacing.lg }}>
          {FEATURES.map((f) => (
            <View key={f.title} style={[styles.featureRow, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
              <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: colors.text, fontSize: fontSize.sm }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textMuted, fontSize: fontSize.xs }]}>{f.desc}</Text>
              </View>
            </View>
          ))}

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
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Débloquer maintenant 🚀</Text>}
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  closeBtn: { position: 'absolute', top: 54, right: 18, zIndex: 2, padding: 4 },
  sparkleTL: { position: 'absolute', top: 70, left: 28, fontSize: 20, opacity: 0.9 },
  sparkleTR: { position: 'absolute', top: 100, right: 44, fontSize: 22, opacity: 0.9 },
  sparkleBL: { position: 'absolute', bottom: 30, left: 50, fontSize: 18, opacity: 0.9 },
  appIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  appIcon: { width: 68, height: 68, borderRadius: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center', color: '#fff' },
  heroSubtitle: { fontSize: 13.5, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8, color: 'rgba(255,255,255,0.9)' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, marginBottom: 10 },
  featureIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featureEmoji: { fontSize: 20 },
  featureTitle: { fontWeight: '700', marginBottom: 2 },
  featureDesc: { lineHeight: 16 },
  priceCard: { borderWidth: 1.5, padding: 18, alignItems: 'center', marginTop: 6, marginBottom: 16 },
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
