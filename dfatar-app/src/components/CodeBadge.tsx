import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function CodeBadge({ code }: { code: string }) {
  const { colors, radius, fontSize } = useTheme();
  return (
    <Text
      style={[
        styles.badge,
        { backgroundColor: colors.primaryMuted, color: colors.primary, borderRadius: radius.sm, fontSize: fontSize.xs },
      ]}
    >
      {code}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 38,
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontWeight: '700',
    letterSpacing: 0.2,
    overflow: 'hidden',
  },
});
