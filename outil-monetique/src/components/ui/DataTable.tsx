import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EmptyState } from './EmptyState';

export interface Colonne<T> {
  cle: string;
  entete: string;
  rendu: (ligne: T) => ReactNode;
  tri?: (a: T, b: T) => number;
}

interface DataTableProps<T> {
  colonnes: Colonne<T>[];
  lignes: T[];
  cleLigne: (ligne: T) => string;
  parPage?: number;
  messageVide?: string;
}

/** Tableau générique : tri par colonne et pagination simple. */
export function DataTable<T>({ colonnes, lignes, cleLigne, parPage = 10, messageVide = 'Aucune donnée.' }: DataTableProps<T>) {
  const [triCle, setTriCle] = useState<string | null>(null);
  const [triAsc, setTriAsc] = useState(true);
  const [page, setPage] = useState(0);

  const lignesTriees = useMemo(() => {
    const colonne = colonnes.find((c) => c.cle === triCle);
    if (!colonne?.tri) return lignes;
    const copie = [...lignes].sort(colonne.tri);
    return triAsc ? copie : copie.reverse();
  }, [lignes, colonnes, triCle, triAsc]);

  const totalPages = Math.max(1, Math.ceil(lignesTriees.length / parPage));
  const pageBornee = Math.min(page, totalPages - 1);
  const lignesPage = lignesTriees.slice(pageBornee * parPage, pageBornee * parPage + parPage);

  function basculerTri(cle: string) {
    if (triCle === cle) {
      setTriAsc((v) => !v);
    } else {
      setTriCle(cle);
      setTriAsc(true);
    }
  }

  if (lignes.length === 0) {
    return <EmptyState message={messageVide} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-surface-border">
              {colonnes.map((colonne) => (
                <th key={colonne.cle} className="text-left px-3 py-2 text-xs font-semibold text-ink-tertiary uppercase tracking-wide">
                  {colonne.tri ? (
                    <button
                      type="button"
                      onClick={() => basculerTri(colonne.cle)}
                      className="flex items-center gap-1 hover:text-ink-secondary"
                    >
                      {colonne.entete}
                      {triCle === colonne.cle &&
                        (triAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </button>
                  ) : (
                    colonne.entete
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignesPage.map((ligne) => (
              <tr key={cleLigne(ligne)} className="border-b border-surface-border last:border-0 hover:bg-surface-tint">
                {colonnes.map((colonne) => (
                  <td key={colonne.cle} className="px-3 py-3 text-ink-primary align-middle">
                    {colonne.rendu(ligne)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px] text-ink-secondary px-1">
          <span>
            Page {pageBornee + 1} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pageBornee === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-full px-3 py-1 border border-surface-border disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={pageBornee >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded-full px-3 py-1 border border-surface-border disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
