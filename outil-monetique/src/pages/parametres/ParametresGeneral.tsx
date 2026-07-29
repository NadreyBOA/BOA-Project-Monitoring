import { Card } from '../../components/ui/Card';

const conventions = [
  { libelle: "Nom de l'outil", valeur: 'Outil de pilotage monétique — Cellule Déploiement BOA' },
  { libelle: 'Langue', valeur: 'Français' },
  { libelle: 'Format de date', valeur: 'JJ/MM/AAAA (stockage ISO)' },
  { libelle: 'Format de montant', valeur: 'FCFA (XOF), séparateur de milliers par espace' },
];

export function ParametresGeneral() {
  return (
    <Card title="Général">
      <p className="text-sm text-ink-secondary -mt-1">
        Conventions transverses de l'outil, communes à tous les modules (cahier, section 3). Elles sont fixées par
        construction ; un écran de configuration (langue multiple, logo personnalisé...) pourra être ajouté si le
        besoin apparaît.
      </p>
      <dl className="flex flex-col divide-y divide-surface-border">
        {conventions.map((c) => (
          <div key={c.libelle} className="grid grid-cols-[220px_1fr] gap-4 py-3">
            <dt className="text-sm font-semibold text-ink-primary">{c.libelle}</dt>
            <dd className="text-sm text-ink-secondary">{c.valeur}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
