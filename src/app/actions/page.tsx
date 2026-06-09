'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { loadProjects, upsertProject } from '@/lib/storage';
import { Project } from '@/lib/types';
import { fmt, isOverdue, getAllOpenActions } from '@/lib/utils';
import { CheckCircle2, Clock } from 'lucide-react';

export default function ActionsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => { setProjects(loadProjects()); }, []);

  const allActions = getAllOpenActions(projects);
  const overdue = allActions.filter(a => isOverdue(a.dueDate));
  const upcoming = allActions.filter(a => !isOverdue(a.dueDate));

  function closeAction(projectId: string, journalId: string, actionId: string) {
    const ps = loadProjects();
    const p = ps.find(p => p.id === projectId);
    if (!p) return;
    const j = p.journal.find(j => j.id === journalId);
    if (!j) return;
    const a = j.actionItems.find(a => a.id === actionId);
    if (!a) return;
    a.status = 'FERME';
    a.closedDate = new Date().toISOString().split('T')[0];
    upsertProject(p);
    setProjects(loadProjects());
  }

  function ActionRow({ a }: { a: ReturnType<typeof getAllOpenActions>[0] & { journalId?: string } }) {
    const late = isOverdue(a.dueDate);
    return (
      <div className={`flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 ${late ? 'bg-red-50/40' : ''}`}>
        <div className="mt-0.5 flex-shrink-0">
          {late ? <Clock size={15} className="text-red-500" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 mt-0.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{a.description}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <Link href={`/projects/${a.projectId}`} className="text-xs text-blue-600 hover:underline">{a.projectCode}</Link>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-600">{a.assignedTo}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className={`text-xs font-medium ${late ? 'text-red-600' : 'text-gray-500'}`}>Échéance : {fmt(a.dueDate)}</span>
          </div>
        </div>
        <button
          onClick={() => {
            const p = projects.find(p => p.id === a.projectId);
            if (!p) return;
            const j = p.journal.find(j => j.actionItems.some(ai => ai.id === a.id));
            if (!j) return;
            closeAction(a.projectId, j.id, a.id);
          }}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
          <CheckCircle2 size={12} /> Clôturer
        </button>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Actions ouvertes</h1>
        <p className="text-sm text-gray-500 mt-0.5">{allActions.length} action(s) en attente sur l'ensemble des projets</p>
      </div>

      <div className="p-8 space-y-6">
        {overdue.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <div className="px-5 py-3 bg-red-50 border-b border-red-200">
              <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                <Clock size={14} /> {overdue.length} action(s) en retard
              </h2>
            </div>
            <div className="divide-y">
              {overdue.map(a => <ActionRow key={a.id} a={a} />)}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-3 border-b">
              <h2 className="text-sm font-semibold text-gray-700">{upcoming.length} action(s) à venir</h2>
            </div>
            <div className="divide-y">
              {upcoming.map(a => <ActionRow key={a.id} a={a} />)}
            </div>
          </div>
        )}

        {allActions.length === 0 && (
          <div className="bg-white rounded-xl border p-16 text-center">
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Toutes les actions sont clôturées !</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
