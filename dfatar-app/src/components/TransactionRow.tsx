import { StyleSheet, Text, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import type { Transaction } from '../types';
import { radius, spacing, fontSize, colors as ColorsType } from '../utils/theme';
import { useTheme } from '../theme/ThemeContext';
import { formatAmount, formatDate } from '../utils/currency';

export function TransactionRow({ transaction, currency }: { transaction: Transaction; currency: string }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isCredit = transaction.type === 'credit';
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: isCredit ? colors.dangerMuted : colors.primaryMuted }]}>
        {isCredit ? (
          <ArrowUpRight color={colors.credit} size={18} />
        ) : (
          <ArrowDownLeft color={colors.payment} size={18} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{isCredit ? 'Dette' : 'Remboursement reçu'}</Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        {!!transaction.note && (
          <Text style={styles.note} numberOfLines={1}>
            {transaction.note}
          </Text>
        )}
        {!!transaction.due_date && (
          <Text style={styles.note} numberOfLines={1}>
            Échéance : {formatDate(transaction.due_date)}
          </Text>
        )}
      </View>
      <Text style={[styles.amount, { color: isCredit ? colors.credit : colors.payment }]}>
        {isCredit ? '+' : '-'}
        {formatAmount(transaction.amount, currency)}
      </Text>
    </View>
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
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    date: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    note: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    amount: {
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
  });
}
