interface TabsProps {
  onglets: { cle: string; libelle: string }[];
  actif: string;
  onChange: (cle: string) => void;
}

/** Bascule à onglets pilule, utilisée pour les vues détail des modules. */
export function Tabs({ onglets, actif, onChange }: TabsProps) {
  return (
    <div className="flex gap-2 border-b border-surface-border">
      {onglets.map((onglet) => (
        <button
          key={onglet.cle}
          type="button"
          onClick={() => onChange(onglet.cle)}
          className={
            onglet.cle === actif
              ? 'px-4 py-2.5 text-sm font-semibold text-boa-green border-b-2 border-boa-green -mb-px'
              : 'px-4 py-2.5 text-sm font-medium text-ink-secondary border-b-2 border-transparent -mb-px hover:text-ink-primary'
          }
        >
          {onglet.libelle}
        </button>
      ))}
    </div>
  );
}
