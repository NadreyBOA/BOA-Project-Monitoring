import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Crown, Infinity as InfinityIcon, Cloud, Palette, X } from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { purchasePremium, restorePremium, isRevenueCatConfigured, FREE_CUSTOMER_LIMIT, PREMIUM_PRICE_LABEL } from '../src/premium';

export default function PaywallScreen() {
  const { fromLimit } = useLocalSearchParams<{ fromLimit?: string }>();
  const { colors, spacing, radius, fontSize } = useTheme();
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
      <Stack.Screen
        options={{
          title: 'Premium',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Fermer">
              <X color={colors.text} size={22} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primaryMuted }]}>
            <Crown color={colors.primary} size={30} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Passez à la version premium !</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            {fromLimit
              ? `Vous avez atteint la limite de ${FREE_CUSTOMER_LIMIT} personnes en version gratuite.`
              : 'Un seul paiement, à vie.'}
          </Text>
        </View>

        <Benefit
          icon={<InfinityIcon color={colors.primary} size={18} />}
          title="Personnes illimitées"
          desc={`Plus de limite de ${FREE_CUSTOMER_LIMIT} personnes suivies.`}
          colors={colors}
          spacing={spacing}
          radius={radius}
          fontSize={fontSize}
        />
        <Benefit
          icon={<Cloud color={colors.primary} size={18} />}
          title="Sauvegarde en ligne"
          desc="Disponible sur n'importe quel appareil, même si vous perdez votre téléphone."
          colors={colors}
          spacing={spacing}
          radius={radius}
          fontSize={fontSize}
        />
        <Benefit
          icon={<Palette color={colors.primary} size={18} />}
          title="Thèmes de personnalisation"
          desc="Changez les couleurs de l'app selon vos goûts."
          colors={colors}
          spacing={spacing}
          radius={radius}
          fontSize={fontSize}
        />

        {!isRevenueCatConfigured && (
          <View style={[styles.warnBox, { backgroundColor: colors.dangerMuted, borderRadius: radius.md, marginBottom: spacing.sm }]}>
            <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>
              Le paiement n'est pas encore configuré pour cette build (clé RevenueCat manquante).
            </Text>
          </View>
        )}

        {error && <Text style={[styles.note, { color: colors.danger, marginBottom: spacing.sm }]}>{error}</Text>}

        <Pressable
          style={[styles.priceBtn, { backgroundColor: colors.primary, borderRadius: radius.md, marginTop: spacing.sm, opacity: busy ? 0.6 : 1 }]}
          onPress={handleUnlock}
          disabled={busy}
        >
          {busy ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.priceBtnText}>Débloquer — {PREMIUM_PRICE_LABEL}</Text>
          )}
        </Pressable>
        <Pressable style={styles.restoreBtn} onPress={handleRestore} disabled={busy}>
          <Text style={[styles.restoreBtnText, { color: colors.textMuted }]}>Restaurer mes achats</Text>
        </Pressable>
        <Text style={[styles.note, { color: colors.textMuted }]}>
          Paiement unique — les futures mises à jour de ces fonctionnalités sont incluses.
        </Text>
      </ScrollView>
    </View>
  );
}

function Benefit({ icon, title, desc, colors, spacing, radius, fontSize }: any) {
  return (
    <View style={[styles.benefitRow, { backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.sm }]}>
      <View style={[styles.benefitIcon, { backgroundColor: colors.primaryMuted }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.benefitTitle, { color: colors.text, fontSize: fontSize.sm }]}>{title}</Text>
        <Text style={[styles.benefitDesc, { color: colors.textMuted, fontSize: fontSize.xs }]}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { alignItems: 'center', paddingVertical: 16 },
  heroIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  heroSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  benefitRow: { flexDirection: 'row', gap: 12, padding: 13, alignItems: 'flex-start' },
  benefitIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { fontWeight: '700' },
  benefitDesc: { marginTop: 2, lineHeight: 16 },
  priceBtn: { paddingVertical: 14, alignItems: 'center' },
  priceBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  note: { textAlign: 'center', fontSize: 11, marginTop: 10 },
  warnBox: { padding: 12 },
  restoreBtn: { paddingVertical: 12, alignItems: 'center' },
  restoreBtnText: { fontWeight: '600', fontSize: 13 },
});
