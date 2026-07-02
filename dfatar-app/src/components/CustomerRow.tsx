import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import type { CustomerWithBalance } from '../types';
import { radius, spacing, fontSize, colors as ColorsType } from '../utils/theme';
import { useTheme } from '../theme/ThemeContext';
import { formatAmount, formatDate } from '../utils/currency';

export function CustomerRow({ customer }: { customer: CustomerWithBalance }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const initial = customer.name.trim().charAt(0).toUpperCase() || '?';
  const owesMoney = customer.balance > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => router.push(`/customer/${customer.id}`)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {customer.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {customer.last_activity ? `Dernière activité ${formatDate(customer.last_activity)}` : 'Aucune transaction'}
        </Text>
      </View>
      {owesMoney ? (
        <View style={styles.balanceBlock}>
          <Text style={[styles.balance, styles.balanceOwed]}>{formatAmount(customer.balance, customer.currency)}</Text>
          <Text style={styles.balanceLabel}>dû</Text>
        </View>
      ) : (
        <View style={styles.settledBadge}>
          <Text style={styles.settledBadgeText}>✓ Soldé</Text>
        </View>
      )}
      <ChevronRight color={colors.textMuted} size={18} />
    </Pressable>
  );
}

function createStyles(colors: typeof ColorsType) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      gap: spacing.md,
    },
    rowPressed: {
      opacity: 0.7,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: colors.primary,
      fontSize: fontSize.md,
      fontWeight: '700',
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
    },
    meta: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    balanceBlock: {
      alignItems: 'flex-end',
    },
    balance: {
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    balanceOwed: {
      color: colors.danger,
    },
    balanceLabel: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    settledBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm + 1,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
      backgroundColor: colors.primaryMuted,
    },
    settledBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.primary,
    },
  });
}
