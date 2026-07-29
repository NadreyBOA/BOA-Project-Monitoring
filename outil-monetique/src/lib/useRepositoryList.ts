import { useCallback, useEffect, useState } from 'react';
import type { ConIdentifiant, Repository } from './repository';

/** Charge et recharge la liste d'un repository ; commun à tous les écrans de référentiel. */
export function useRepositoryList<T extends ConIdentifiant>(repo: Repository<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [chargement, setChargement] = useState(true);

  const recharger = useCallback(() => {
    setChargement(true);
    return repo.list().then((liste) => {
      setItems(liste);
      setChargement(false);
    });
  }, [repo]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { items, chargement, recharger };
}
