'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, ListTodo, AlertTriangle,
  ChevronRight, Leaf
} from 'lucide-react';

const nav = [
  { href: '/',         label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/projects', label: 'Projets',          icon: FolderOpen },
  { href: '/actions',  label: 'Actions ouvertes', icon: ListTodo },
  { href: '/risks',    label: 'Risques',           icon: AlertTriangle },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col bg-boa-navy text-white z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-boa-green">
          <Leaf size={17} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight tracking-wide">BOA Monitoring</p>
          <p className="text-xs text-white/50 leading-tight">Projets Monétique</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-boa-green text-white font-medium'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-xs text-white/40 mb-0.5">Chef de Projet Monétique</p>
        <p className="text-sm font-semibold text-white">Nadrey BOA</p>
      </div>
    </aside>
  );
}
