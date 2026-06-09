import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BOA – Monitoring Projets Monétique',
  description: 'Outil de suivi et monitoring des projets monétique – Bank of Africa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
