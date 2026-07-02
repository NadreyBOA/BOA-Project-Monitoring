import { useState } from 'react';
import { Modal, View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { CURRENCIES } from '../data/currencies';
import { COUNTRIES } from '../data/countries';
import { CodeBadge } from './CodeBadge';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (currencyCode: string) => void;
}

export function CurrencyPicker({ visible, title = 'Choisir une devise', onClose, onSelect }: Props) {
  const { colors, spacing, radius, fontSize } = useTheme();
  const [mode, setMode] = useState<'currency' | 'country'>('currency');
  const [query, setQuery] = useState('');

  function reset() {
    setMode('currency');
    setQuery('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSelect(code: string) {
    reset();
    onSelect(code);
  }

  const q = query.trim().toLowerCase();
  const currencyData = CURRENCIES.filter((c) => c.label.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  const countryData = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable onPress={handleClose} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft color={colors.text} size={22} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        <View style={{ padding: spacing.md }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={mode === 'currency' ? 'Rechercher une devise' : 'Rechercher un pays'}
            placeholderTextColor={colors.textMuted}
            style={[styles.search, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md }]}
          />
        </View>
        {mode === 'currency' ? (
          <FlatList
            data={currencyData}
            keyExtractor={(item) => item.code}
            contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
            renderItem={({ item }) => (
              <Pressable style={[styles.row, { backgroundColor: colors.surface, borderRadius: radius.md }]} onPress={() => handleSelect(item.code)}>
                <CodeBadge code={item.code} />
                <Text style={[styles.rowText, { color: colors.text, fontSize: fontSize.sm }]}>{item.label}</Text>
              </Pressable>
            )}
            ListFooterComponent={
              <Pressable onPress={() => setMode('country')} style={styles.footerLink}>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: fontSize.sm }}>Voir tous les pays →</Text>
              </Pressable>
            }
          />
        ) : (
          <FlatList
            data={countryData}
            keyExtractor={(item) => item.cc}
            contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
            renderItem={({ item }) => (
              <Pressable style={[styles.row, { backgroundColor: colors.surface, borderRadius: radius.md }]} onPress={() => handleSelect(item.currency)}>
                <CodeBadge code={item.cc} />
                <Text style={[styles.rowText, { color: colors.text, fontSize: fontSize.sm }]}>{item.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{item.currency}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700' },
  search: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 11, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 6 },
  rowText: { flex: 1, fontWeight: '600' },
  footerLink: { alignItems: 'center', paddingVertical: 14 },
});
