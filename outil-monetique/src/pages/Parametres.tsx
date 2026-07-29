import { useState } from 'react';
import { Tabs } from '../components/ui/Tabs';
import { ParametresEntites } from './parametres/ParametresEntites';
import { ParametresPersonnes } from './parametres/ParametresPersonnes';
import { ParametresReferentielSimple } from './parametres/ParametresReferentielSimple';
import { ParametresRoles } from './parametres/ParametresRoles';
import { ParametresKPI } from './parametres/ParametresKPI';
import { ParametresGeneral } from './parametres/ParametresGeneral';
import { editeursRepo, modulesRepo, reseauxRepo } from '../lib/repositories';

const sections = [
  { cle: 'entites', libelle: 'Entités' },
  { cle: 'personnes', libelle: 'Personnes' },
  { cle: 'referentiels', libelle: 'Référentiels' },
  { cle: 'roles', libelle: 'Rôles et droits' },
  { cle: 'kpi', libelle: 'KPI' },
  { cle: 'general', libelle: 'Général' },
];

const referentiels = [
  { cle: 'reseaux', libelle: 'Réseaux' },
  { cle: 'modules', libelle: 'Modules' },
  { cle: 'editeurs', libelle: 'Éditeurs' },
];

export function Parametres() {
  const [sectionActive, setSectionActive] = useState('entites');
  const [referentielActif, setReferentielActif] = useState('reseaux');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-ink-secondary mb-1">Entités, personnes, référentiels et rôles</p>
        <h1 className="text-[34px] font-extrabold text-ink-primary text-balance">Paramètres</h1>
      </div>

      <Tabs onglets={sections} actif={sectionActive} onChange={setSectionActive} />

      {sectionActive === 'entites' && <ParametresEntites />}
      {sectionActive === 'personnes' && <ParametresPersonnes />}
      {sectionActive === 'roles' && <ParametresRoles />}
      {sectionActive === 'kpi' && <ParametresKPI />}
      {sectionActive === 'general' && <ParametresGeneral />}

      {sectionActive === 'referentiels' && (
        <div className="flex flex-col gap-4">
          <Tabs onglets={referentiels} actif={referentielActif} onChange={setReferentielActif} />
          {referentielActif === 'reseaux' && (
            <ParametresReferentielSimple titre="Réseaux" boutonLibelle="Nouveau réseau" placeholder="ex. GIM-UEMOA" repo={reseauxRepo} />
          )}
          {referentielActif === 'modules' && (
            <ParametresReferentielSimple titre="Modules" boutonLibelle="Nouveau module" placeholder="ex. SVFE" repo={modulesRepo} />
          )}
          {referentielActif === 'editeurs' && (
            <ParametresReferentielSimple titre="Éditeurs" boutonLibelle="Nouvel éditeur" placeholder="ex. BPC" repo={editeursRepo} />
          )}
        </div>
      )}
    </div>
  );
}
