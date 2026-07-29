import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  FolderKanban,
  ClipboardCheck,
  Layers,
  Package,
  Zap,
  Settings,
} from 'lucide-react';

const modules = [
  { chemin: '/', libelle: 'Tableau de bord', icone: LayoutGrid },
  { chemin: '/projets', libelle: 'Projets', icone: FolderKanban },
  { chemin: '/tests', libelle: 'Tests', icone: ClipboardCheck },
  { chemin: '/environnements', libelle: 'Environnements', icone: Layers },
  { chemin: '/patchs', libelle: 'Patchs', icone: Package },
  { chemin: '/run', libelle: 'Run', icone: Zap },
];

export function Sidebar() {
  return (
    <aside className="w-[76px] shrink-0 bg-surface-card shadow-[1px_0_0_#EEF0F3] flex flex-col items-center gap-2 py-5 sticky top-0 h-screen">
      {modules.map(({ chemin, libelle, icone: Icone }) => (
        <NavLink
          key={chemin}
          to={chemin}
          end={chemin === '/'}
          title={libelle}
          aria-label={libelle}
          className={({ isActive }) =>
            `w-11 h-11 rounded-2xl flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-boa-navy ${
              isActive ? 'bg-boa-green text-white' : 'text-ink-secondary hover:bg-boa-green-50 hover:text-boa-green'
            }`
          }
        >
          <Icone className="w-5 h-5" />
        </NavLink>
      ))}

      <div className="flex-1" />

      <NavLink
        to="/parametres"
        title="Paramètres"
        aria-label="Paramètres"
        className={({ isActive }) =>
          `w-11 h-11 rounded-2xl flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-boa-navy ${
            isActive ? 'bg-boa-green text-white' : 'text-ink-secondary hover:bg-boa-green-50 hover:text-boa-green'
          }`
        }
      >
        <Settings className="w-5 h-5" />
      </NavLink>
    </aside>
  );
}
