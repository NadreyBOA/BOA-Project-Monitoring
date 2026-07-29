import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const roles = [
  {
    nom: 'Administrateur',
    description: "Accès complet à l'outil : gestion des paramètres, des référentiels et des droits.",
  },
  {
    nom: 'Coordinateur',
    description: 'Profil Cellule Déploiement : création et gestion des projets, tests, environnements, patchs et run.',
  },
  {
    nom: 'Testeur',
    description: 'Exécution des cas de test, saisie des résultats, consultation des modules.',
  },
  {
    nom: 'Observateur',
    description: 'Consultation et tableaux de bord uniquement (ex. DSI, responsables filiales), sans modification.',
  },
];

export function ParametresRoles() {
  return (
    <Card title="Rôles et droits">
      <p className="text-sm text-ink-secondary -mt-1">
        Rôles applicatifs par défaut. Les droits sur les environnements (Lecture, Exécution, Administration) se
        gèrent objet par objet, indépendamment du rôle applicatif. L'éditeur de permissions personnalisées et le
        contrôle d'accès aux actions arrivent avec le Lot 8 (Finitions) — ces rôles sont pour l'instant une
        référence, non modifiable.
      </p>
      <ul className="flex flex-col gap-3">
        {roles.map((role) => (
          <li key={role.nom} className="flex items-start gap-3 border border-surface-border rounded-chip px-4 py-3">
            <div className="pt-0.5">
              <Badge label={role.nom} tone="info" />
            </div>
            <p className="text-sm text-ink-secondary">{role.description}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
