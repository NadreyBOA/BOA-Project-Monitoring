import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  valeur: string;
  onChange: (valeur: string) => void;
}

export function SearchBar({ placeholder = 'Rechercher...', valeur, onChange }: SearchBarProps) {
  return (
    <label className="flex-1 flex items-center gap-2.5 bg-surface-app rounded-full px-4 py-2.5 text-ink-tertiary">
      <Search className="w-4 h-4 shrink-0" />
      <input
        type="text"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-none bg-transparent outline-none flex-1 text-sm text-ink-primary placeholder:text-ink-tertiary"
      />
    </label>
  );
}
