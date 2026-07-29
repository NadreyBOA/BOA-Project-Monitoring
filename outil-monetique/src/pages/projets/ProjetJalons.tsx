import { useState } from 'react';
import { Plus, TriangleAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Field, champClasses } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/format';
import { toneStatutJalon } from '../../lib/jalonTone';
import { champsAudit } from '../../lib/repository';
import { jalonsRepo } from '../../lib/repositories';
import { useUtilisateurCourant } from '../../lib/currentUser';
import { tracer } from '../../lib/journal';
import type { Jalon, Personne, Projet, StatutJalon } from '../../lib/types';

interface ProjetJalonsProps {
  projet: Projet;
  jalons: Jalon[];
  personnes: Personne[];
  recharger: () => void;
}

interface FormJalon {
  libelle: string;
  dateCible: string;
  statut: StatutJalon;
  responsableId: string;
}

function formVide(responsableParDefaut: string): FormJalon {
  return { libelle: '', dateCible: new Date().toISOString().slice(0, 10), statut: 'À venir', responsableId: responsableParDefaut };
}

export function ProjetJalons({ projet, jalons, personnes, recharger }: ProjetJalonsProps) {
  const utilisateurCourant = useUtilisateurCourant();
  const jalonsProjet = jalons.filter((j) => j.projetId === projet.id).sort((a, b) => a.dateCible.localeCompare(b.dateCible));

  const [jalonEnEdition, setJalonEnEdition] = useState<Jalon | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState<FormJalon>(formVide(projet.responsableId));

  const nomPersonne = (personneId: string) => personnes.find((p) => p.id === personneId)?.nom ?? '—';
  const estEnRetard = (jalon: Jalon) => jalon.statut !== 'Atteint' && new Date(jalon.dateCible).getTime() < Date.now();

  function ouvrirCreation() {
    setJalonEnEdition(null);
    setForm(formVide(projet.responsableId));
    setOuvert(true);
  }

  function ouvrirEdition(jalon: Jalon) {
    setJalonEnEdition(jalon);
    setForm({ libelle: jalon.libelle, dateCible: jalon.dateCible, statut: jalon.statut, responsableId: jalon.responsableId });
    setOuvert(true);
  }

  async function enregistrer() {
    if (!form.libelle.trim() || !utilisateurCourant) return;
    if (jalonEnEdition) {
      await jalonsRepo.update(jalonEnEdition.id, { ...form, dateModification: new Date().toISOString(), modifiePar: utilisateurCourant.id });
      await tracer('projet', projet.id, 'modification', utilisateurCourant.id, `Jalon « ${form.libelle} » modifié.`);
    } else {
      await jalonsRepo.create({ ...champsAudit(utilisateurCourant.id), projetId: projet.id, ...form });
      await tracer('projet', projet.id, 'modification', utilisateurCourant.id, `Jalon « ${form.libelle} » ajouté.`);
    }
    setOuvert(false);
    recharger();
  }

  return (
    <>
      <Card
        title="Jalons"
        actions={
          <button
            type="button"
            onClick={ouvrirCreation}
            className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700"
          >
            <Plus className="w-4 h-4" /> Ajouter un jalon
          </button>
        }
      >
        {jalonsProjet.length === 0 ? (
          <EmptyState message="Aucun jalon pour ce projet." />
        ) : (
          <ul className="flex flex-col gap-3">
            {jalonsProjet.map((jalon) => (
              <li
                key={jalon.id}
                className="flex items-center justify-between gap-3 border border-surface-border rounded-chip px-4 py-3 cursor-pointer hover:border-boa-navy-50"
                onClick={() => ouvrirEdition(jalon)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {estEnRetard(jalon) && <TriangleAlert className="w-4 h-4 text-status-critical shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-primary truncate">{jalon.libelle}</p>
                    <p className="text-xs text-ink-tertiary">{nomPersonne(jalon.responsableId)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-ink-secondary tabular-nums">{formatDate(jalon.dateCible)}</span>
                  <Badge label={estEnRetard(jalon) ? 'En retard' : jalon.statut} tone={estEnRetard(jalon) ? 'critical' : toneStatutJalon[jalon.statut]} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={jalonEnEdition ? 'Modifier le jalon' : 'Nouveau jalon'}
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
          <Field label="Libellé">
            <input value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} className={champClasses} />
          </Field>
          <Field label="Date cible">
            <input type="date" value={form.dateCible} onChange={(e) => setForm({ ...form, dateCible: e.target.value })} className={champClasses} />
          </Field>
          <Field label="Statut">
            <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as StatutJalon })} className={champClasses}>
              {(['À venir', 'Atteint', 'En retard'] as StatutJalon[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Responsable">
            <select value={form.responsableId} onChange={(e) => setForm({ ...form, responsableId: e.target.value })} className={champClasses}>
              {personnes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Drawer>
    </>
  );
}
