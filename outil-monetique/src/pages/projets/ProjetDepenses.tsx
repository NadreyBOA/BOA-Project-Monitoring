import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Colonne } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { formatDate, formatMontant } from '../../lib/format';
import { champsAudit } from '../../lib/repository';
import { depensesRepo, personnesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { tracer } from '../../lib/journal';
import type { CategorieDepense, Depense, Projet } from '../../lib/types';

const categories: CategorieDepense[] = ['Prestation', 'Licence', 'Matériel', 'Déplacement', 'Autre'];

interface ProjetDepensesProps {
  projet: Projet;
  depenses: Depense[];
  recharger: () => void;
}

interface FormDepense {
  date: string;
  libelle: string;
  categorie: CategorieDepense;
  montant: string;
  justificatif: string;
}

function formVide(): FormDepense {
  return { date: new Date().toISOString().slice(0, 10), libelle: '', categorie: 'Prestation', montant: '0', justificatif: '' };
}

export function ProjetDepenses({ projet, depenses, recharger }: ProjetDepensesProps) {
  const { items: personnes } = useRepositoryList(personnesRepo);
  const utilisateurCourant = useUtilisateurCourant();
  const depensesProjet = depenses.filter((d) => d.projetId === projet.id).sort((a, b) => b.date.localeCompare(a.date));

  const [depenseEnEdition, setDepenseEnEdition] = useState<Depense | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState<FormDepense>(formVide());

  const nomPersonne = (id: string) => personnes.find((p) => p.id === id)?.nom ?? '—';
  const total = depensesProjet.reduce((s, d) => s + d.montant, 0);
  const sousTotaux = categories
    .map((c) => ({ categorie: c, montant: depensesProjet.filter((d) => d.categorie === c).reduce((s, d) => s + d.montant, 0) }))
    .filter((s) => s.montant > 0);

  function ouvrirCreation() {
    setDepenseEnEdition(null);
    setForm(formVide());
    setOuvert(true);
  }

  function ouvrirEdition(depense: Depense) {
    setDepenseEnEdition(depense);
    setForm({ date: depense.date, libelle: depense.libelle, categorie: depense.categorie, montant: String(depense.montant), justificatif: depense.justificatif ?? '' });
    setOuvert(true);
  }

  async function enregistrer() {
    if (!form.libelle.trim() || !utilisateurCourant) return;
    const donnees = {
      date: form.date,
      libelle: form.libelle,
      categorie: form.categorie,
      montant: Number(form.montant) || 0,
      justificatif: form.justificatif || undefined,
    };
    if (depenseEnEdition) {
      await depensesRepo.update(depenseEnEdition.id, { ...donnees, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
      await tracer('projet', projet.id, 'modification', utilisateurCourant.id, `Dépense « ${donnees.libelle} » modifiée.`);
    } else {
      await depensesRepo.create({ ...champsAudit(utilisateurCourant.id), projetId: projet.id, auteurId: utilisateurCourant.id, ...donnees });
      await tracer('projet', projet.id, 'modification', utilisateurCourant.id, `Dépense « ${donnees.libelle} » ajoutée (${formatMontant(donnees.montant)}).`);
    }
    setOuvert(false);
    recharger();
  }

  const colonnes: Colonne<Depense>[] = [
    { cle: 'date', entete: 'Date', rendu: (d) => formatDate(d.date), tri: (a, b) => a.date.localeCompare(b.date) },
    { cle: 'libelle', entete: 'Libellé', rendu: (d) => d.libelle },
    { cle: 'categorie', entete: 'Catégorie', rendu: (d) => <Badge label={d.categorie} tone="neutral" /> },
    { cle: 'montant', entete: 'Montant', rendu: (d) => <span className="tabular-nums font-semibold">{formatMontant(d.montant)}</span>, tri: (a, b) => a.montant - b.montant },
    { cle: 'auteur', entete: 'Auteur', rendu: (d) => nomPersonne(d.auteurId) },
    { cle: 'justificatif', entete: 'Justificatif', rendu: (d) => d.justificatif ?? '—' },
    {
      cle: 'actions',
      entete: '',
      rendu: (d) => (
        <div className="flex justify-end">
          <button type="button" onClick={() => ouvrirEdition(d)} className="text-xs font-semibold text-boa-navy hover:underline">
            Modifier
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Journal des dépenses"
        actions={
          <button
            type="button"
            onClick={ouvrirCreation}
            className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700"
          >
            <Plus className="w-4 h-4" /> Ajouter une dépense
          </button>
        }
      >
        <DataTable colonnes={colonnes} lignes={depensesProjet} cleLigne={(d) => d.id} messageVide="Aucune dépense enregistrée pour ce projet." />

        {depensesProjet.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-surface-border text-sm">
            <span className="font-bold text-ink-primary">
              Total : <span className="tabular-nums">{formatMontant(total)}</span>
            </span>
            {sousTotaux.map((s) => (
              <span key={s.categorie} className="text-ink-secondary">
                {s.categorie} : <span className="font-semibold tabular-nums text-ink-primary">{formatMontant(s.montant)}</span>
              </span>
            ))}
          </div>
        )}
      </Card>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={depenseEnEdition ? 'Modifier la dépense' : 'Nouvelle dépense'}
        footer={
          <button
            type="button"
            onClick={enregistrer}
            className="w-full rounded-full py-2.5 text-sm font-semibold bg-boa-green text-white hover:bg-boa-green-700"
          >
            Enregistrer
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Date">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={champClasses} />
          </Field>
          <Field label="Libellé">
            <input value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} className={champClasses} />
          </Field>
          <Field label="Catégorie">
            <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value as CategorieDepense })} className={champClasses}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Montant (FCFA)">
            <input type="number" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} className={champClasses} />
          </Field>
          <Field label="Justificatif (nom de fichier ou lien)">
            <input value={form.justificatif} onChange={(e) => setForm({ ...form, justificatif: e.target.value })} className={champClasses} />
          </Field>
        </div>
      </Drawer>
    </>
  );
}
