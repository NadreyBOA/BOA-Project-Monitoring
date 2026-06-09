'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { loadProjects } from '@/lib/storage';
import { Project } from '@/lib/types';
import {
  getProjectStats, getAllOpenActions,
  STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS,
  HEALTH_COLORS, HEALTH_LABELS, fmt, isOverdue, JOURNAL_TYPE_LABELS, JOURNAL_TYPE_COLORS,
  CATEGORY_LABELS
} from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import {
  FolderOpen, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, Activity, Plus, ChevronRight, AlertCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => { setProjects(loadProjects()); }, []);

  const stats = getProjectStats(projects);
  const openActions = getAllOpenActions(projects);
  const overdueActions = openActions.filter(a => isOverdue(a.dueDate));
  const criticalRisks = projects.flatMap(p =>
    p.risks.filter(r => r.score >= 6 && r.status !== 'CLOS' && r.status !== 'MITIGE')
      .map(r => ({ ...r, projectId: p.id, projectName: p.name, projectCode: p.code }))
  );

  const recentJournal = projects
    .flatMap(p => p.journal.map(j => ({ ...j, projectId: p.id, projectName: p.name, projectCode: p.code })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const statusPie = [
    { name: 'En cours', value: stats.enCours, color: '#1B7A4B' },
    { name: 'Planifié', value: projects.filter(p => p.status === 'PLANIFIE').length, color: '#1B2E5E' },
    { name: 'Terminé', value: stats.termine, color: '#145c38' },
    { name: 'En pause', value: projects.filter(p => p.status === 'EN_PAUSE').length, color: '#d4830a' },
    { name: 'Annulé', value: projects.filter(p => p.status === 'ANNULE').length, color: '#c0392b' },
  ].filter(d => d.value > 0);

  const categoryBar = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1; return acc;
    }, {})
  ).map(([cat, count]) => ({ name: CATEGORY_LABELS[cat] ?? cat, count }));

  const attention = projects
    .filter(p => p.healthStatus !== 'VERT' || (p.status === 'EN_COURS' && isOverdue(p.plannedEndDate)))
    .sort((a, b) => (a.healthStatus === 'ROUGE' ? -1 : 1));

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vue d'ensemble de l'activité projet</p>
        </div>
        <Link href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#145c38] transition-colors">
          <Plus size={16} /> Nouveau projet
        </Link>
      </div>

      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard icon={<FolderOpen size={20} className="text-[#1B2E5E]" />} label="Total projets" value={stats.total} bg="bg-[#e8ecf5]" />
          <KPICard icon={<Activity size={20} className="text-green-600" />} label="En cours" value={stats.enCours} bg="bg-green-50" />
          <KPICard icon={<Clock size={20} className="text-red-600" />} label="En retard" value={stats.enRetard} bg="bg-red-50" alert={stats.enRetard > 0} />
          <KPICard icon={<CheckCircle2 size={20} className="text-emerald-600" />} label="Terminés" value={stats.termine} bg="bg-emerald-50" />
        </div>

        {/* Health + Actions row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-[#1B7A4B] ring-4 ring-[#e8f5ee]" />
            <div><p className="text-2xl font-bold text-gray-900">{stats.vert}</p><p className="text-sm text-gray-500">Projets sains</p></div>
          </div>
          <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-[#d4830a] ring-4 ring-[#fdf6e8]" />
            <div><p className="text-2xl font-bold text-gray-900">{stats.orange}</p><p className="text-sm text-gray-500">À surveiller</p></div>
          </div>
          <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-[#c0392b] ring-4 ring-[#fdf0ef]" />
            <div><p className="text-2xl font-bold text-gray-900">{stats.rouge}</p><p className="text-sm text-gray-500">En danger</p></div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Répartition par statut</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Projets par catégorie</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryBar} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#efefec" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B7A4B" radius={[4, 4, 0, 0]} name="Projets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projets nécessitant attention + activité récente */}
        <div className="grid grid-cols-2 gap-6">
          {/* Attention */}
          <div className="bg-white rounded-xl border">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertCircle size={15} className="text-orange-500" /> Projets nécessitant attention
              </h2>
              <span className="text-xs text-gray-400">{attention.length} projets</span>
            </div>
            <div className="divide-y">
              {attention.length === 0 && (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">Tous les projets sont sains ✓</p>
              )}
              {attention.slice(0, 4).map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${HEALTH_COLORS[p.healthStatus]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.code} · Fin prévue : {fmt(p.plannedEndDate)}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent journal */}
          <div className="bg-white rounded-xl border">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingUp size={15} className="text-blue-500" /> Activité récente
              </h2>
            </div>
            <div className="divide-y">
              {recentJournal.length === 0 && (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucune activité enregistrée</p>
              )}
              {recentJournal.map(j => (
                <Link key={j.id} href={`/projects/${j.projectId}#journal`} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${JOURNAL_TYPE_COLORS[j.type]}`}>
                    {JOURNAL_TYPE_LABELS[j.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{j.title}</p>
                    <p className="text-xs text-gray-400">{j.projectCode} · {fmt(j.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Actions ouvertes en retard */}
        {overdueActions.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle size={15} /> {overdueActions.length} action(s) en retard
            </h2>
            <div className="space-y-2">
              {overdueActions.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-2.5 border border-red-100">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{a.description}</p>
                    <p className="text-xs text-gray-500">{a.projectCode} · {a.assignedTo} · Échéance : {fmt(a.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risques critiques */}
        {criticalRisks.length > 0 && (
          <div className="bg-white rounded-xl border">
            <div className="px-5 py-4 border-b">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertTriangle size={15} className="text-red-500" /> Risques critiques / élevés
              </h2>
            </div>
            <div className="divide-y">
              {criticalRisks.slice(0, 5).map(r => (
                <Link key={r.id} href={`/projects/${r.projectId}#risks`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${r.score >= 8 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    Score {r.score}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-400">{r.projectCode} · {r.owner}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function KPICard({ icon, label, value, bg, alert }: { icon: React.ReactNode; label: string; value: number; bg: string; alert?: boolean }) {
  return (
    <div className={`rounded-xl border bg-white p-5 flex items-center gap-4 ${alert && value > 0 ? 'border-red-200' : ''}`}>
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${bg}`}>{icon}</div>
      <div>
        <p className={`text-2xl font-bold ${alert && value > 0 ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
