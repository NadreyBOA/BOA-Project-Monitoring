interface AvatarProps {
  nom: string;
  taille?: number;
  couleur?: string;
}

function initiales(nom: string): string {
  return nom
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase())
    .join('');
}

export function Avatar({ nom, taille = 36, couleur = '#044C7E' }: AvatarProps) {
  return (
    <span
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: taille, height: taille, backgroundColor: couleur, fontSize: taille * 0.36 }}
      title={nom}
    >
      {initiales(nom)}
    </span>
  );
}
