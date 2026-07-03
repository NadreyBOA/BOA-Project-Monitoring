import { useState } from 'react';
import { Modal, View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, Check, Lock, Briefcase, User } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import type { Space } from '../db/spaces';
import type { AccountType } from '../types';

interface Props {
  visible: boolean;
  spaces: Space[];
  currentSpaceId: string | null;
  canCreateSpace: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreate: (name: string, accountType: AccountType) => void;
  onLockedCreatePress: () => void;
}

export function SpacePicker({
  visible,
  spaces,
  currentSpaceId,
  canCreateSpace,
  onClose,
  onSelect,
  onCreate,
  onLockedCreatePress,
}: Props) {
  const { colors, spacing, radius, fontSize } = useTheme();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('particulier');

  function reset() {
    setCreating(false);
    setName('');
    setAccountType('particulier');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCreatePress() {
    if (!canCreateSpace) {
      onLockedCreatePress();
      return;
    }
    setCreating(true);
  }

  function submitCreate() {
    if (!name.trim()) return;
    onCreate(name.trim(), accountType);
    reset();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable onPress={creating ? () => setCreating(false) : handleClose} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft color={colors.text} size={22} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>{creating ? 'Nouvel espace' : 'Vos espaces'}</Text>
        </View>

        {creating ? (
          <View style={{ padding: spacing.md }}>
            <Text style={[styles.label, { color: colors.text }]}>Nom de l'espace</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Mon commerce"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md },
              ]}
              autoFocus
            />
            <Text style={[styles.label, { color: colors.text, marginTop: spacing.md }]}>Type</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Pressable
                onPress={() => setAccountType('pro')}
                style={[
                  styles.typeBtn,
                  { borderColor: colors.border, borderRadius: radius.md },
                  accountType === 'pro' && { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
                ]}
              >
                <Briefcase color={colors.text} size={16} />
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: fontSize.sm }}>Professionnel</Text>
              </Pressable>
              <Pressable
                onPress={() => setAccountType('particulier')}
                style={[
                  styles.typeBtn,
                  { borderColor: colors.border, borderRadius: radius.md },
                  accountType === 'particulier' && { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
                ]}
              >
                <User color={colors.text} size={16} />
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: fontSize.sm }}>Particulier</Text>
              </Pressable>
            </View>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Le type ne pourra plus être modifié après la création de l'espace.
            </Text>
            <Pressable
              disabled={!name.trim()}
              onPress={submitCreate}
              style={[
                styles.createBtn,
                { backgroundColor: colors.primary, borderRadius: radius.md, opacity: name.trim() ? 1 : 0.5 },
              ]}
            >
              <Text style={styles.createBtnText}>Créer l'espace</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={spaces}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.md }}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.row, { backgroundColor: colors.surface, borderRadius: radius.md }]}
                onPress={() => onSelect(item.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: fontSize.sm }}>{item.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                    {item.accountType === 'pro' ? 'Professionnel' : 'Particulier'}
                  </Text>
                </View>
                {item.id === currentSpaceId && <Check color={colors.primary} size={18} />}
              </Pressable>
            )}
            ListFooterComponent={
              <Pressable
                onPress={handleCreatePress}
                style={[styles.row, styles.newRow, { borderColor: colors.border, borderRadius: radius.md }]}
              >
                {!canCreateSpace && <Lock color={colors.textMuted} size={16} />}
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: fontSize.sm }}>+ Nouvel espace</Text>
              </Pressable>
            }
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
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, padding: 12, justifyContent: 'center' },
  hint: { fontSize: 12.5, marginTop: 10, marginBottom: 16 },
  createBtn: { paddingVertical: 13, alignItems: 'center' },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 6 },
  newRow: { borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center' },
});
