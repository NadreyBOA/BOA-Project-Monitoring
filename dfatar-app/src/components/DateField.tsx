import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

function parseDateInput(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

function toDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DateField({
  value,
  onChange,
  error,
  placeholder = 'Choisir une date',
}: {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  placeholder?: string;
}) {
  const { colors, radius, fontSize } = useTheme();
  const [open, setOpen] = useState(false);
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(value);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setOpen(false);
    if (event.type === 'dismissed' || !selectedDate) return;
    onChange(toDateInput(selectedDate));
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
        <Text style={{ color: isValid ? colors.text : colors.textMuted, fontSize: fontSize.md }}>
          {isValid ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(parseDateInput(value)) : placeholder}
        </Text>
        <Calendar color={colors.textMuted} size={18} />
      </Pressable>
      {open && (
        <DateTimePicker
          value={isValid ? parseDateInput(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
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
