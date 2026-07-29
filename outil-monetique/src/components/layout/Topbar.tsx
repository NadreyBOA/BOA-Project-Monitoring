import { useState } from 'react';
import { Bell, HelpCircle, Mail } from 'lucide-react';
import { Pill } from '../ui/Pill';
import { IconButton } from '../ui/IconButton';
import { Avatar } from '../ui/Avatar';
import { SearchBar } from '../ui/SearchBar';

const periodes = ["Aujourd'hui", 'Cette semaine', 'Ce mois', 'Tout'];

export function Topbar() {
  const [periodeActive, setPeriodeActive] = useState('Ce mois');
  const [recherche, setRecherche] = useState('');

  return (
    <header className="bg-surface-card border-b border-surface-border px-8 py-4 flex flex-col gap-3.5">
      <div className="flex items-center gap-5">
        <div className="flex flex-col leading-tight mr-auto">
          <div className="flex items-center gap-2">
            <span className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-boa-green to-boa-green-700 shrink-0" />
            <span className="font-extrabold text-[15px] tracking-wide text-boa-navy">BANK OF AFRICA</span>
          </div>
          <span className="text-[11px] text-ink-tertiary ml-[34px]">Cellule Déploiement monétique</span>
        </div>

        <div className="flex gap-2 shrink-0">
          {periodes.map((periode) => (
            <Pill key={periode} label={periode} active={periode === periodeActive} onClick={() => setPeriodeActive(periode)} />
          ))}
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          <IconButton icon={Mail} label="Messagerie" />
          <IconButton icon={Bell} label="Notifications" hasNotification />
          <IconButton icon={HelpCircle} label="Aide" />
          <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-surface-border">
            <Avatar nom="Aïcha Konaté" taille={38} />
            <div className="leading-tight">
              <div className="text-[13.5px] font-bold text-ink-primary">Aïcha Konaté</div>
              <div className="text-[11.5px] text-ink-secondary">Cellule Déploiement</div>
            </div>
          </div>
        </div>
      </div>

      <SearchBar
        placeholder="Rechercher un patch, une filiale, une échéance..."
        valeur={recherche}
        onChange={setRecherche}
      />
    </header>
  );
}
