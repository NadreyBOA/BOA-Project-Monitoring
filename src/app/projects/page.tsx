'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { loadProjects, deleteProject } from '@/lib/storage';
import { Project, ProjectStatus, ProjectPriority, ProjectCategory } from '@/lib/types';
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS,
  HEALTH_COLORS, HEALTH_LABELS, CATEGORY_LABELS, fmt, daysLeft, isOverdue
} from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { Plus, Search, Filter, Trash2, Pencil, Eye, ChevronDown } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<ProjectPriority | ''>('');
  const [filterCat, setFilterCat] = useState<ProjectCategory | ''>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { setProjects(loadProjects()); }, []);

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.projectManager.toLowerCase().includes(q);
    const matchStatus = !filterStatus || p.status === filterStatus;
    const matchPriority = !filterPriority || p.priority === filterPriority;
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchStatus && matchPriority && matchCat;
  });

  function handleDelete(id: string) {
    deleteProject(id);
    setProjects(loadProjects());
    setConfirmDelete(null);
  }

  return (
    <AppLayout>
      <div className="bg-white border-b px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projets</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} projet(s)</p>
        </div>
        <Link href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#145c38] transition-colors">
          <Plus size={16} /> Nouveau projet
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B7A4B]"
          />
        </div>
        <Select value={filterStatus} onChange={v => setFilterStatus(v as ProjectStatus | '')} placeholder="Statut">
          {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </Select>
        <Select value={filterPriority} onChange={v => setFilterPriority(v as ProjectPriority | '')} placeholder="Priorité">
          {(Object.keys(PRIORITY_LABELS) as ProjectPriority[]).map(p => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </Select>
        <Select value={filterCat} onChange={v => setFilterCat(v as ProjectCategory | '')} placeholder="Catégorie">
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        {(search || filterStatus || filterPriority || filterCat) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); setFilterCat(''); }}
            className="text-xs text-gray-500 hover:text-gray-800 underline">Effacer</button>
        )}
      </div>

      <div className="p-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">Aucun projet trouvé.</p>
            <Link href="/projects/new" className="mt-3 inline-flex items-center gap-2 text-sm text-[#1B7A4B] hover:underline">
              <Plus size={14} /> Créer votre premier projet
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Projet</th>
                  <th className="px-4 py-3 text-left font-medium">Statut</th>
                  <th className="px-4 py-3 text-left font-medium">Priorité</th>
                  <th className="px-4 py-3 text-left font-medium">Santé</th>
                  <th className="px-4 py-3 text-left font-medium">Avancement</th>
                  <th className="px-4 py-3 text-left font-medium">Chef de projet</th>
                  <th className="px-4 py-3 text-left font-medium">Fin prévue</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(p => {
                  const overdue = p.status === 'EN_COURS' && isOverdue(p.plannedEndDate);
                  const days = daysLeft(p.plannedEndDate);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.code} · {CATEGORY_LABELS[p.category]}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={PRIORITY_COLORS[p.priority]}>{PRIORITY_LABELS[p.priority]}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium`}>
                          <span className={`w-2 h-2 rounded-full ${HEALTH_COLORS[p.healthStatus]}`} />
                          {HEALTH_LABELS[p.healthStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 w-36">
                        <div className="space-y-1">
                          <ProgressBar value={p.progress} size="sm" showLabel />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{p.projectManager}</td>
                      <td className="px-4 py-3.5">
                        <p className={overdue ? 'text-red-600 font-medium' : 'text-gray-700'}>{fmt(p.plannedEndDate)}</p>
                        {p.status === 'EN_COURS' && (
                          <p className={`text-xs mt-0.5 ${overdue ? 'text-red-500' : days <= 30 ? 'text-orange-500' : 'text-gray-400'}`}>
                            {overdue ? `${Math.abs(days)}j de retard` : `${days}j restants`}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/projects/${p.id}`}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-[#1B7A4B] transition-colors" title="Voir">
                            <Eye size={15} />
                          </Link>
                          <Link href={`/projects/${p.id}/edit`}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-[#1B7A4B] transition-colors" title="Modifier">
                            <Pencil size={15} />
                          </Link>
                          <button onClick={() => setConfirmDelete(p.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors" title="Supprimer">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Supprimer ce projet ?</h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible. Toutes les données associées seront perdues.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Select({ value, onChange, placeholder, children }: {
  value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B7A4B] bg-white text-gray-700">
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}
