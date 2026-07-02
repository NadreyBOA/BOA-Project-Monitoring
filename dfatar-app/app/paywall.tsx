import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Crown, Infinity as InfinityIcon, Cloud, Palette } from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { unlockPremium, FREE_CUSTOMER_LIMIT, PREMIUM_PRICE_LABEL } from '../src/premium';

export default function PaywallScreen() {
  const { fromLimit } = useLocalSearchParams<{ fromLimit?: string }>();
  const { colors, spacing, radius, fontSize } = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();

  async function handleUnlock() {
    await unlockPremium(db);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Premium' }} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: '#F7EFDD' }]}>
            <Crown color="#B8862E" size={30} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Débloquer Dfatar Premium</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            {fromLimit
              ? `Vous avez atteint la limite de ${FREE_CUSTOMER_LIMIT} personnes en version gratuite.`
              : 'Un seul paiement, à vie.'}
          </Text>
        </View>

        <Benefit
          icon={<InfinityIcon color="#B8862E" size={18} />}
          title="Personnes illimitées"
          desc={`Plus de limite de ${FREE_CUSTOMER_LIMIT} personnes suivies.`}
          colors={colors}
          spacing={spacing}
          radius={radius}
          fontSize={fontSize}
        />
        <Benefit
          icon={<Cloud color="#B8862E" size={18} />}
          title="Sauvegarde en ligne"
          desc="Vos données protégées même si vous perdez votre téléphone."
          colors={colors}
          spacing={spacing}
          radius={radius}
          fontSize={fontSize}
        />
        <Benefit
          icon={<Palette color="#B8862E" size={18} />}
          title="Thèmes de personnalisation"
          desc="Changez les couleurs de l'app selon vos goûts."
          colors={colors}
          spacing={spacing}
          radius={radius}
          fontSize={fontSize}
        />

        <Pressable style={[styles.priceBtn, { backgroundColor: '#B8862E', borderRadius: radius.md, marginTop: spacing.sm }]} onPress={handleUnlock}>
          <Text style={styles.priceBtnText}>Débloquer — {PREMIUM_PRICE_LABEL}</Text>
        </Pressable>
        <Text style={[styles.note, { color: colors.textMuted }]}>
          Démo : le déblocage est simulé pour l'instant (pas encore de compte développeur configuré), aucun montant n'est prélevé.
        </Text>
      </ScrollView>
    </View>
  );
}

function Benefit({ icon, title, desc, colors, spacing, radius, fontSize }: any) {
  return (
    <View style={[styles.benefitRow, { backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.sm }]}>
      <View style={[styles.benefitIcon, { backgroundColor: '#F7EFDD' }]}>{icon}</View>
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
});
