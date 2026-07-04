import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

function parseTimeInput(value: string): Date {
  const [h, m] = value.split(':').map(Number);
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
}

function toTimeInput(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function TimeField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}) {
  const { colors, radius, fontSize } = useTheme();
  const [open, setOpen] = useState(false);
  const isValid = /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setOpen(false);
    if (event.type === 'dismissed' || !selectedDate) return;
    onChange(toTimeInput(selectedDate));
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.input,
          { borderColor: error ? colors.danger : colors.border, backgroundColor: colors.surface, borderRadius: radius.md },
        ]}
      >
        <Text style={{ color: colors.text, fontSize: fontSize.md }}>{isValid ? value : '--:--'}</Text>
        <Clock color={colors.textMuted} size={18} />
      </Pressable>
      {open && (
        <DateTimePicker
          value={isValid ? parseTimeInput(value) : new Date()}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
});
