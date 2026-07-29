import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

interface PageStubProps {
  eyebrow: string;
  titre: string;
  message: string;
}

/** Écran d'attente pour un module dont le lot de développement n'est pas encore livré. */
export function PageStub({ eyebrow, titre, message }: PageStubProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-ink-secondary mb-1">{eyebrow}</p>
        <h1 className="text-[34px] font-extrabold text-ink-primary text-balance">{titre}</h1>
      </div>
      <Card>
        <EmptyState message={message} />
      </Card>
    </div>
  );
}
