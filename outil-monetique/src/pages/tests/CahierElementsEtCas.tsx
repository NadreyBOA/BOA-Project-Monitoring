import { useState } from 'react';
import { Plus, Copy } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { modulesRepo } from '../../lib/repositories';
import { useRepositoryList } from '../../lib/useRepositoryList';
import type { CahierDeTest, CasDeTest, ElementATester, StatutCasDeTest } from '../../lib/types';
import { ElementFormDrawer } from './ElementFormDrawer';
import { CasFormDrawer } from './CasFormDrawer';

const toneStatutCas: Record<StatutCasDeTest, BadgeTone> = {
  'Non exécuté': 'neutral',
  Réussi: 'success',
  Échoué: 'critical',
  Bloqué: 'warning',
  'Non applicable': 'neutral',
};

interface CahierElementsEtCasProps {
  cahier: CahierDeTest;
  elements: ElementATester[];
  cas: CasDeTest[];
  recharger: () => void;
}

export function CahierElementsEtCas({ cahier, elements, cas, recharger }: CahierElementsEtCasProps) {
  const { items: modules } = useRepositoryList(modulesRepo);
  const elementsCahier = elements.filter((e) => e.cahierId === cahier.id);

  const [elementFormOuvert, setElementFormOuvert] = useState(false);
  const [elementEnEdition, setElementEnEdition] = useState<ElementATester | undefined>();

  const [casFormOuvert, setCasFormOuvert] = useState(false);
  const [elementIdPourCas, setElementIdPourCas] = useState<string>('');
  const [casEnEdition, setCasEnEdition] = useState<CasDeTest | undefined>();
  const [casADupliquer, setCasADupliquer] = useState<CasDeTest | undefined>();

  function ouvrirNouvelElement() {
    setElementEnEdition(undefined);
    setElementFormOuvert(true);
  }
  function ouvrirEditionElement(element: ElementATester) {
    setElementEnEdition(element);
    setElementFormOuvert(true);
  }
  function ouvrirNouveauCas(elementId: string) {
    setElementIdPourCas(elementId);
    setCasEnEdition(undefined);
    setCasADupliquer(undefined);
    setCasFormOuvert(true);
  }
  function ouvrirEditionCas(elementId: string, casItem: CasDeTest) {
    setElementIdPourCas(elementId);
    setCasEnEdition(casItem);
    setCasADupliquer(undefined);
    setCasFormOuvert(true);
  }
  function ouvrirDuplicationCas(elementId: string, casItem: CasDeTest) {
    setElementIdPourCas(elementId);
    setCasEnEdition(undefined);
    setCasADupliquer(casItem);
    setCasFormOuvert(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={ouvrirNouvelElement}
          className="flex items-center gap-1.5 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold bg-boa-green text-white hover:bg-boa-green-700"
        >
          <Plus className="w-4 h-4" /> Ajouter un élément
        </button>
      </div>

      {elementsCahier.length === 0 ? (
        <Card>
          <EmptyState message="Aucun élément à tester pour ce cahier." />
        </Card>
      ) : (
        elementsCahier.map((element) => {
          const casElement = cas.filter((c) => c.elementId === element.id);
          return (
            <Card
              key={element.id}
              title={
                <span className="flex items-center gap-2">
                  {element.libelle}
                  <Badge label={modules.find((m) => m.id === element.moduleId)?.nom ?? '?'} tone="info" />
                </span>
              }
              actions={
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => ouvrirEditionElement(element)} className="text-xs font-semibold text-boa-navy hover:underline">
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => ouvrirNouveauCas(element.id)}
                    className="flex items-center gap-1 rounded-full pl-2.5 pr-3 py-1.5 text-xs font-semibold bg-boa-green-50 text-boa-green-700 hover:bg-boa-green hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" /> Cas
                  </button>
                </div>
              }
            >
              <p className="text-sm text-ink-secondary -mt-1">{element.description}</p>
              {casElement.length === 0 ? (
                <p className="text-sm text-ink-tertiary">Aucun cas de test pour cet élément.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {casElement.map((casItem) => (
                    <li key={casItem.id} className="flex items-center justify-between gap-3 border border-surface-border rounded-chip px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-primary">
                          <span className="text-ink-tertiary font-mono mr-1.5">{casItem.reference}</span>
                          {casItem.titre}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge label={casItem.statut} tone={toneStatutCas[casItem.statut]} />
                        <button type="button" onClick={() => ouvrirEditionCas(element.id, casItem)} className="text-xs font-semibold text-boa-navy hover:underline">
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => ouvrirDuplicationCas(element.id, casItem)}
                          title="Dupliquer"
                          className="text-ink-tertiary hover:text-boa-navy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })
      )}

      <ElementFormDrawer
        open={elementFormOuvert}
        onClose={() => setElementFormOuvert(false)}
        cahierId={cahier.id}
        element={elementEnEdition}
        onSaved={recharger}
      />
      <CasFormDrawer
        open={casFormOuvert}
        onClose={() => setCasFormOuvert(false)}
        cahierId={cahier.id}
        elementId={elementIdPourCas}
        cas={casEnEdition}
        dupliquerDepuis={casADupliquer}
        onSaved={recharger}
      />
    </div>
  );
}
