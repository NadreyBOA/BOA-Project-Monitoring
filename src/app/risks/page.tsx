'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { loadProjects } from '@/lib/storage';
import { Project } from '@/lib/types';
import { riskLevel, fmt } from '@/lib/utils';

export default function RisksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { setProjects(loadProjects()); }, []);

  const allRisks = projects.flatMap(p =>
    p.risks.map(r => ({ ...r, projectId: p.id, projectName: p.name, projectCode: p.code }))
  ).filter(r => r.status !== 'CLOS').sort((a, b) => b.score - a.score);

  const levels = [
    { label: 'Critiques', min: 9, color: 'text-red-700 bg-red-100', border: 'border-red-200' },
    { label: 'Élevés', min: 6, max: 8, color: 'text-orange-700 bg-orange-100', border: 'border-orange-200' },
    { label: 'Moyens', min: 3, max: 5, color: 'text-yellow-700 bg-yellow-100', border: 'border-yellow-200' },
    { label: 'Faibles', min: 1, max: 2, color: 'text-green-700 bg-green-100', border: 'border-green-200' },
  ];

  return (
    <AppLayout>
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Risques</h1>
        <p className="text-sm text-gray-500 mt-0.5">Vue consolidée des risques ouverts sur tous les projets</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {levels.map(({ label, min, max, color, border }) => {
            const count = allRisks.filter(r => r.score >= min && (max === undefined || r.score <= max)).length;
            return (
              <div key={label} className={`bg-white rounded-xl border ${border} p-5`}>
                <p className={`text-3xl font-bold ${color.split(' ')[0]}`}>{count}</p>
                <p className="text-sm text-gray-600 mt-1">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {allRisks.length === 0 && (
            <p className="px-5 py-12 text-sm text-gray-400 text-center">Aucun risque ouvert.</p>
          )}
          {allRisks.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Risque</th>
                  <th className="px-4 py-3 text-left">Projet</th>
                  <th className="px-4 py-3 text-left">Catégorie</th>
                  <th className="px-4 py-3 text-center">P</th>
                  <th className="px-4 py-3 text-center">I</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Responsable</th>
                  <th className="px-4 py-3 text-left">Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allRisks.map(r => {
                  const lv = riskLevel(r.score);
                  const sc = lv === 'CRITIQUE' ? 'bg-red-100 text-red-700' : lv === 'ELEVE' ? 'bg-orange-100 text-orange-700' : lv === 'MOYEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{r.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/projects/${r.projectId}#risks`} className="text-sm text-[#1B7A4B] hover:underline font-medium">{r.projectCode}</Link>
                        <p className="text-xs text-gray-400">{r.projectName}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.category}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium">{r.probability}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium">{r.impact}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${sc}`}>{r.score}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.status}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.owner}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{r.mitigation || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
