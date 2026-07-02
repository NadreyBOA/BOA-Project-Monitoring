import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Briefcase, User, Search, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { COUNTRIES } from '../src/data/countries';
import { CodeBadge } from '../src/components/CodeBadge';
import { completeOnboarding } from '../src/db/settings';
import type { AccountType } from '../src/types';

export default function OnboardingScreen() {
  const { colors, spacing, radius, fontSize } = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();
  const { review } = useLocalSearchParams<{ review?: string }>();
  const isReview = review === '1';

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [query, setQuery] = useState('');

  async function finish(countryCode: string, currency: string) {
    if (!accountType) return;
    await completeOnboarding(db, { accountType, displayName: displayName.trim(), countryCode, baseCurrency: currency });
    router.replace('/');
  }

  if (step === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {isReview && (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ChevronLeft color={colors.text} size={22} />
            </Pressable>
          )}
          <Text style={[styles.headerTitle, { color: colors.text }]}>Bienvenue sur Dfatar</Text>
        </View>
        <View style={{ padding: spacing.md }}>
          <Text style={[styles.intro, { color: colors.textMuted }]}>Pour commencer, dites-nous qui vous êtes.</Text>
          <ChoiceCard
            icon={<Briefcase color={colors.primary} size={20} />}
            title="Professionnel"
            desc="Je gère un commerce et j'accorde du crédit à mes clients."
            onPress={() => { setAccountType('pro'); setStep(1); }}
            colors={colors} spacing={spacing} radius={radius} fontSize={fontSize}
          />
          <ChoiceCard
            icon={<User color={colors.primary} size={20} />}
            title="Particulier"
            desc="Je prête de l'argent à mes proches et je veux garder le fil."
            onPress={() => { setAccountType('particulier'); setStep(1); }}
            colors={colors} spacing={spacing} radius={radius} fontSize={fontSize}
          />
        </View>
      </View>
    );
  }

  if (step === 1) {
    const isPro = accountType === 'pro';
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => setStep(0)} hitSlop={8}><ChevronLeft color={colors.text} size={22} /></Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{isPro ? 'Votre entreprise' : 'Votre nom'}</Text>
        </View>
        <View style={{ padding: spacing.md, flex: 1 }}>
          <Text style={[styles.label, { color: colors.text }]}>
            {isPro ? "Quel est le nom de votre entreprise ?" : 'Quel est votre nom ?'}
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={isPro ? 'Ex: Épicerie Al Amal' : 'Ex: Yasmine Idrissi'}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md }]}
            autoFocus
          />
        </View>
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable
            disabled={!displayName.trim()}
            style={[styles.primaryBtn, { backgroundColor: colors.primary, borderRadius: radius.md, opacity: displayName.trim() ? 1 : 0.5 }]}
            onPress={() => setStep(2)}
          >
            <Text style={styles.primaryBtnText}>Continuer</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // step 2: country
  const q = query.trim().toLowerCase();
  const data = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => setStep(1)} hitSlop={8}><ChevronLeft color={colors.text} size={22} /></Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Votre pays</Text>
      </View>
      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Ça fixe la devise utilisée dans toute l'app (modifiable plus tard dans les paramètres).
        </Text>
        <View style={[styles.search, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md }]}>
          <Search color={colors.textMuted} size={16} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un pays"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.cc}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.countryRow, { backgroundColor: colors.surface, borderRadius: radius.md }]}
            onPress={() => finish(item.cc, item.currency)}
          >
            <CodeBadge code={item.cc} />
            <Text style={[styles.countryName, { color: colors.text, fontSize: fontSize.sm }]}>{item.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{item.currency}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

function ChoiceCard({ icon, title, desc, onPress, colors, spacing, radius, fontSize }: any) {
  return (
    <Pressable
      style={[styles.choiceCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, marginBottom: spacing.sm }]}
      onPress={onPress}
    >
      <View style={[styles.choiceIcon, { backgroundColor: colors.primaryMuted }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.choiceTitle, { color: colors.text, fontSize: fontSize.md }]}>{title}</Text>
        <Text style={[styles.choiceDesc, { color: colors.textMuted, fontSize: fontSize.xs }]}>{desc}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 54, paddingBottom: 14, paddingHorizontal: 18, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  intro: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
  choiceCard: { flexDirection: 'row', gap: 12, borderWidth: 1.5, padding: 16, alignItems: 'flex-start' },
  choiceIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  choiceTitle: { fontWeight: '700', marginBottom: 3 },
  choiceDesc: { lineHeight: 17 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 },
  footer: { padding: 16, borderTopWidth: 1 },
  primaryBtn: { paddingVertical: 13, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint: { fontSize: 12.5, marginBottom: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 4 },
  searchInput: { flex: 1, fontSize: 14 },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 6 },
  countryName: { flex: 1, fontWeight: '600' },
});
