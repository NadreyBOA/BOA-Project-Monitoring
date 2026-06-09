'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { getProject, upsertProject } from '@/lib/storage';
import { Project, Milestone, Task, Risk, JournalEntry, Comment, ActionItem, Person, Stakeholder } from '@/lib/types';
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS,
  HEALTH_COLORS, HEALTH_LABELS, MILESTONE_STATUS_LABELS, MILESTONE_STATUS_COLORS,
  TASK_STATUS_LABELS, TASK_STATUS_COLORS, JOURNAL_TYPE_LABELS, JOURNAL_TYPE_COLORS,
  CATEGORY_LABELS, fmt, daysLeft, isOverdue, computeMilestoneProgress, computeRiskScore, riskLevel, newId
} from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';
import {
  ArrowLeft, Pencil, Plus, ChevronDown, ChevronRight, CheckCircle2,
  Clock, AlertTriangle, Users, BookOpen, DollarSign, MessageSquare,
  Flag, Calendar, Target, Trash2, Check, X, ChevronUp
} from 'lucide-react';

type Tab = 'apercu' | 'jalons' | 'journal' | 'risques' | 'budget' | 'equipe' | 'commentaires';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<Tab>('apercu');
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  // Modals
  const [journalModal, setJournalModal] = useState(false);
  const [riskModal, setRiskModal] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [taskModal, setTaskModal] = useState<{ milestoneId: string } | null>(null);
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);

  const load = useCallback(() => {
    const p = getProject(id);
    if (!p) router.push('/projects');
    else setProject(p);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  function save(updated: Project) {
    upsertProject(updated);
    setProject({ ...updated, updatedAt: new Date().toISOString() });
  }

  if (!project) return <AppLayout><div className="flex items-center justify-center h-64"><p className="text-gray-400">Chargement…</p></div></AppLayout>;

  const overdue = project.status === 'EN_COURS' && isOverdue(project.plannedEndDate);
  const days = daysLeft(project.plannedEndDate);
  const openRisks = project.risks.filter(r => r.status !== 'CLOS' && r.status !== 'MITIGE');
  const openActions = project.journal.flatMap(j => j.actionItems.filter(a => a.status !== 'FERME'));

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'apercu', label: 'Aperçu', icon: <Target size={14} /> },
    { id: 'jalons', label: 'Jalons & Tâches', icon: <CheckCircle2 size={14} />, count: project.milestones.length },
    { id: 'journal', label: 'Journal', icon: <BookOpen size={14} />, count: project.journal.length },
    { id: 'risques', label: 'Risques', icon: <AlertTriangle size={14} />, count: openRisks.length },
    { id: 'budget', label: 'Budget', icon: <DollarSign size={14} /> },
    { id: 'equipe', label: 'Équipe', icon: <Users size={14} />, count: project.team.length },
    { id: 'commentaires', label: 'Commentaires', icon: <MessageSquare size={14} />, count: project.comments.length },
  ];

  return (
    <AppLayout>
      {/* Top bar */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={15} /> Projets
          </Link>
          <span className="text-gray-300">/</span>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
              <span className="text-sm text-gray-400 font-mono">{project.code}</span>
              <div className={`w-2.5 h-2.5 rounded-full ${HEALTH_COLORS[project.healthStatus]}`} title={HEALTH_LABELS[project.healthStatus]} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={STATUS_COLORS[project.status]}>{STATUS_LABELS[project.status]}</Badge>
          <Badge className={PRIORITY_COLORS[project.priority]}>{PRIORITY_LABELS[project.priority]}</Badge>
          <Link href={`/projects/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
            <Pencil size={14} /> Modifier
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b px-8 py-2">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 w-32">Avancement global</span>
          <div className="flex-1"><ProgressBar value={project.progress} size="md" showLabel /></div>
          {overdue && <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">{Math.abs(days)}j de retard</span>}
          {!overdue && project.status === 'EN_COURS' && <span className="text-xs text-gray-500">{days}j restants</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-8">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-[#003087] text-[#003087]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.icon} {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`ml-1 text-xs rounded-full w-5 h-5 flex items-center justify-center ${tab === t.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-8 flex-1">
        {/* ── APERÇU ── */}
        {tab === 'apercu' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-5">
              {/* Key info */}
              <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Catégorie" value={CATEGORY_LABELS[project.category]} />
                  <InfoRow label="Chef de projet" value={project.projectManager} />
                  <InfoRow label="Sponsor" value={project.sponsor || '—'} />
                  <InfoRow label="Date de début" value={fmt(project.startDate)} />
                  <InfoRow label="Fin prévue" value={fmt(project.plannedEndDate)} className={overdue ? 'text-red-600 font-medium' : ''} />
                  <InfoRow label="Fin réelle" value={fmt(project.actualEndDate)} />
                  <InfoRow label="Durée prévue" value={project.plannedDurationDays ? `${project.plannedDurationDays} jours` : '—'} />
                  <InfoRow label="Mis à jour" value={fmt(project.updatedAt, 'dd/MM/yyyy HH:mm')} />
                </div>
              </div>

              {/* Objectifs */}
              <div className="bg-white rounded-xl border p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Cadrage du projet</h3>
                {project.objectives && <TextBlock label="Objectifs" text={project.objectives} />}
                {project.scope && <TextBlock label="Périmètre (in-scope)" text={project.scope} />}
                {project.outOfScope && <TextBlock label="Hors périmètre" text={project.outOfScope} />}
                {project.successCriteria && <TextBlock label="Critères de succès" text={project.successCriteria} />}
                {project.assumptions && <TextBlock label="Hypothèses" text={project.assumptions} />}
                {project.constraints && <TextBlock label="Contraintes" text={project.constraints} />}
                {project.interProjectDependencies && <TextBlock label="Dépendances inter-projets" text={project.interProjectDependencies} />}
              </div>

              {/* Description */}
              {project.description && (
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Health & stats */}
              <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Santé du projet</h3>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${project.healthStatus === 'VERT' ? 'bg-green-50' : project.healthStatus === 'ORANGE' ? 'bg-orange-50' : 'bg-red-50'}`}>
                  <div className={`w-4 h-4 rounded-full ${HEALTH_COLORS[project.healthStatus]}`} />
                  <span className="text-sm font-medium">{HEALTH_LABELS[project.healthStatus]}</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Jalons terminés</span>
                    <span className="font-medium">{project.milestones.filter(m => m.status === 'TERMINE').length}/{project.milestones.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Actions ouvertes</span>
                    <span className={`font-medium ${openActions.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>{openActions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Risques ouverts</span>
                    <span className={`font-medium ${openRisks.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{openRisks.length}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="bg-white rounded-xl border p-5 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions rapides</h3>
                <button onClick={() => { setTab('journal'); setJournalModal(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus size={14} className="text-blue-600" /> Ajouter une entrée journal
                </button>
                <button onClick={() => { setTab('risques'); setRiskModal(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus size={14} className="text-orange-600" /> Ajouter un risque
                </button>
                <button onClick={() => { setTab('commentaires'); setCommentModal(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus size={14} className="text-green-600" /> Ajouter un commentaire
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── JALONS & TÂCHES ── */}
        {tab === 'jalons' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800">Jalons & Tâches</h2>
              <button onClick={() => setMilestoneModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#003087] text-white rounded-lg text-sm hover:bg-blue-800 transition-colors">
                <Plus size={14} /> Ajouter un jalon
              </button>
            </div>

            {project.milestones.length === 0 && (
              <div className="bg-white rounded-xl border p-12 text-center">
                <p className="text-gray-400 text-sm">Aucun jalon défini. Commencez par créer le premier jalon du projet.</p>
              </div>
            )}

            {project.milestones.sort((a, b) => a.order - b.order).map(ms => {
              const expanded = expandedMilestones.has(ms.id);
              const msProgress = computeMilestoneProgress(ms);
              const msOverdue = isOverdue(ms.plannedDate) && ms.status !== 'TERMINE' && ms.status !== 'ANNULE';
              return (
                <div key={ms.id} className="bg-white rounded-xl border overflow-hidden">
                  {/* Milestone header */}
                  <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedMilestones(prev => {
                      const n = new Set(prev);
                      n.has(ms.id) ? n.delete(ms.id) : n.add(ms.id);
                      return n;
                    })}>
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#003087] text-white text-xs font-bold flex-shrink-0">
                      {ms.order}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-900">{ms.name}</p>
                        <Badge className={MILESTONE_STATUS_COLORS[ms.status]}>{MILESTONE_STATUS_LABELS[ms.status]}</Badge>
                        {msOverdue && <span className="text-xs text-red-600 font-medium">⚠ En retard</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-400">Prévu : {fmt(ms.plannedDate)}</span>
                        {ms.actualDate && <span className="text-xs text-green-600">Réalisé : {fmt(ms.actualDate)}</span>}
                        <span className="text-xs text-gray-400">Resp. : {ms.responsible}</span>
                        <span className="text-xs text-gray-400">{ms.tasks.length} tâche(s)</span>
                      </div>
                    </div>
                    <div className="w-32 flex-shrink-0">
                      <ProgressBar value={msProgress} size="sm" showLabel />
                    </div>
                    {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>

                  {/* Milestone details */}
                  {expanded && (
                    <div className="border-t">
                      {ms.description && (
                        <p className="px-5 py-3 text-sm text-gray-600 bg-gray-50 border-b">{ms.description}</p>
                      )}
                      {ms.deliverables.length > 0 && (
                        <div className="px-5 py-3 bg-gray-50 border-b">
                          <p className="text-xs font-medium text-gray-500 mb-1">Livrables :</p>
                          <div className="flex flex-wrap gap-2">
                            {ms.deliverables.map((d, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border rounded text-xs text-gray-700">{d}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tasks */}
                      <div className="divide-y">
                        {ms.tasks.length === 0 && (
                          <p className="px-5 py-4 text-sm text-gray-400">Aucune tâche</p>
                        )}
                        {ms.tasks.map(task => (
                          <TaskRow key={task.id} task={task} onStatusChange={(status) => {
                            const updated = { ...project };
                            const m = updated.milestones.find(m => m.id === ms.id)!;
                            const t = m.tasks.find(t => t.id === task.id)!;
                            t.status = status;
                            t.progress = status === 'TERMINE' ? 100 : t.progress;
                            if (status === 'TERMINE') t.actualDate = new Date().toISOString().split('T')[0];
                            save(updated);
                          }} />
                        ))}
                      </div>

                      <div className="px-5 py-3 border-t bg-gray-50">
                        <button onClick={() => setTaskModal({ milestoneId: ms.id })}
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                          <Plus size={12} /> Ajouter une tâche
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── JOURNAL ── */}
        {tab === 'journal' && (
          <div className="space-y-4" id="journal">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800">Journal des événements</h2>
              <button onClick={() => setJournalModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#003087] text-white rounded-lg text-sm hover:bg-blue-800">
                <Plus size={14} /> Nouvelle entrée
              </button>
            </div>

            {project.journal.length === 0 && (
              <div className="bg-white rounded-xl border p-12 text-center">
                <p className="text-gray-400 text-sm">Aucune entrée dans le journal.</p>
              </div>
            )}

            {[...project.journal].sort((a, b) => b.date.localeCompare(a.date)).map(entry => (
              <div key={entry.id} className="bg-white rounded-xl border overflow-hidden">
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 w-16">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${JOURNAL_TYPE_COLORS[entry.type]}`}>
                      {JOURNAL_TYPE_LABELS[entry.type]}
                    </span>
                    <span className="text-xs text-gray-400">{fmt(entry.date)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 mb-1">{entry.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{entry.description}</p>
                    {entry.location && <p className="text-xs text-gray-400 mt-1">📍 {entry.location}</p>}
                    {entry.participants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {entry.participants.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{p}</span>
                        ))}
                      </div>
                    )}

                    {entry.actionItems.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</p>
                        {entry.actionItems.map(action => (
                          <div key={action.id} className={`flex items-start gap-3 p-2.5 rounded-lg border text-sm ${action.status === 'FERME' ? 'bg-gray-50 opacity-70' : isOverdue(action.dueDate) ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
                            <button onClick={() => {
                              const updated = { ...project };
                              const j = updated.journal.find(j => j.id === entry.id)!;
                              const a = j.actionItems.find(a => a.id === action.id)!;
                              a.status = a.status === 'FERME' ? 'OUVERT' : 'FERME';
                              if (a.status === 'FERME') a.closedDate = new Date().toISOString().split('T')[0];
                              save(updated);
                            }} className="mt-0.5 flex-shrink-0">
                              {action.status === 'FERME'
                                ? <CheckCircle2 size={15} className="text-green-500" />
                                : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={action.status === 'FERME' ? 'line-through text-gray-400' : 'text-gray-800'}>{action.description}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {action.assignedTo} · Échéance : {fmt(action.dueDate)}
                                {action.status === 'FERME' && action.closedDate && ` · Clôturé : ${fmt(action.closedDate)}`}
                              </p>
                            </div>
                            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${action.status === 'FERME' ? 'bg-green-100 text-green-700' : action.status === 'EN_COURS' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                              {action.status === 'FERME' ? 'Fermé' : action.status === 'EN_COURS' ? 'En cours' : 'Ouvert'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {entry.nextMeetingDate && (
                      <p className="text-xs text-gray-500 mt-2">📅 Prochaine réunion : {fmt(entry.nextMeetingDate)}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingJournal(entry)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={13} /></button>
                    <button onClick={() => {
                      const updated = { ...project, journal: project.journal.filter(j => j.id !== entry.id) };
                      save(updated);
                    }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── RISQUES ── */}
        {tab === 'risques' && (
          <div className="space-y-4" id="risks">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800">Registre des risques</h2>
              <button onClick={() => setRiskModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#003087] text-white rounded-lg text-sm hover:bg-blue-800">
                <Plus size={14} /> Nouveau risque
              </button>
            </div>

            {/* Risk matrix summary */}
            <div className="grid grid-cols-4 gap-3">
              {[{ label: 'Critiques', min: 9, color: 'bg-red-50 border-red-200 text-red-700' },
                { label: 'Élevés', min: 6, max: 8, color: 'bg-orange-50 border-orange-200 text-orange-700' },
                { label: 'Moyens', min: 3, max: 5, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                { label: 'Faibles', min: 1, max: 2, color: 'bg-green-50 border-green-200 text-green-700' },
              ].map(({ label, min, max, color }) => {
                const count = project.risks.filter(r => r.score >= min && (max === undefined || r.score <= max) && r.status !== 'CLOS').length;
                return (
                  <div key={label} className={`rounded-xl border p-4 ${color}`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm font-medium">{label}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              {project.risks.length === 0 && (
                <p className="px-5 py-12 text-sm text-gray-400 text-center">Aucun risque identifié.</p>
              )}
              {project.risks.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Risque</th>
                      <th className="px-4 py-3 text-left">Catégorie</th>
                      <th className="px-4 py-3 text-center">Prob.</th>
                      <th className="px-4 py-3 text-center">Impact</th>
                      <th className="px-4 py-3 text-center">Score</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-left">Responsable</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {project.risks.map(risk => {
                      const level = riskLevel(risk.score);
                      const scoreColor = level === 'CRITIQUE' ? 'bg-red-100 text-red-700' : level === 'ELEVE' ? 'bg-orange-100 text-orange-700' : level === 'MOYEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
                      return (
                        <tr key={risk.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-900">{risk.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{risk.description}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{risk.category}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-medium">{risk.probability}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-medium">{risk.impact}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${scoreColor}`}>{risk.score}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium">{risk.status}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{risk.owner}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setEditingRisk(risk)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Pencil size={13} /></button>
                              <button onClick={() => {
                                save({ ...project, risks: project.risks.filter(r => r.id !== risk.id) });
                              }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── BUDGET ── */}
        {tab === 'budget' && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-gray-800">Budget</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-gray-500 mb-1">Budget estimé</p>
                <p className="text-2xl font-bold text-gray-900">{fmtAmount(project.budget.totalEstimated, project.budget.currency)}</p>
              </div>
              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-gray-500 mb-1">Dépensé</p>
                <p className="text-2xl font-bold text-gray-900">{fmtAmount(project.budget.totalActual, project.budget.currency)}</p>
              </div>
              <div className="bg-white rounded-xl border p-5">
                <p className="text-xs text-gray-500 mb-1">Écart</p>
                <p className={`text-2xl font-bold ${project.budget.totalActual > project.budget.totalEstimated ? 'text-red-600' : 'text-green-600'}`}>
                  {fmtAmount(project.budget.totalActual - project.budget.totalEstimated, project.budget.currency)}
                </p>
              </div>
            </div>

            {project.budget.totalEstimated > 0 && (
              <div className="bg-white rounded-xl border p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Consommation budgétaire</span>
                  <span className="text-sm font-medium">{Math.round((project.budget.totalActual / project.budget.totalEstimated) * 100)}%</span>
                </div>
                <ProgressBar value={Math.round((project.budget.totalActual / project.budget.totalEstimated) * 100)} size="md" />
              </div>
            )}

            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-4 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700">Ventilation budgétaire</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Catégorie</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-right">Estimé ({project.budget.currency})</th>
                    <th className="px-4 py-3 text-right">Réel ({project.budget.currency})</th>
                    <th className="px-4 py-3 text-right">Écart</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {project.budget.lines.map(line => {
                    const ecart = (line.actual ?? 0) - line.estimated;
                    return (
                      <tr key={line.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium">{line.category}</td>
                        <td className="px-4 py-3 text-gray-600">{line.description}</td>
                        <td className="px-4 py-3 text-right">{line.estimated.toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-3 text-right">{line.actual ? line.actual.toLocaleString('fr-FR') : '—'}</td>
                        <td className={`px-4 py-3 text-right font-medium ${line.actual && ecart > 0 ? 'text-red-600' : line.actual && ecart < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {line.actual ? (ecart > 0 ? '+' : '') + ecart.toLocaleString('fr-FR') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t font-semibold">
                    <td className="px-5 py-3" colSpan={2}>Total</td>
                    <td className="px-4 py-3 text-right">{project.budget.totalEstimated.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right">{project.budget.totalActual.toLocaleString('fr-FR')}</td>
                    <td className={`px-4 py-3 text-right ${project.budget.totalActual > project.budget.totalEstimated ? 'text-red-600' : 'text-green-600'}`}>
                      {((project.budget.totalActual - project.budget.totalEstimated) > 0 ? '+' : '') + (project.budget.totalActual - project.budget.totalEstimated).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ── ÉQUIPE ── */}
        {tab === 'equipe' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Team */}
              <div className="bg-white rounded-xl border">
                <div className="px-5 py-4 border-b">
                  <h3 className="text-sm font-semibold text-gray-700">Équipe projet</h3>
                </div>
                <div className="divide-y">
                  {project.team.length === 0 && <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucun membre d'équipe</p>}
                  {project.team.map(member => (
                    <div key={member.id} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#003087] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}{member.organization ? ` · ${member.organization}` : ''}</p>
                        {member.email && <p className="text-xs text-gray-400">{member.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stakeholders */}
              <div className="bg-white rounded-xl border">
                <div className="px-5 py-4 border-b">
                  <h3 className="text-sm font-semibold text-gray-700">Parties prenantes</h3>
                </div>
                <div className="divide-y">
                  {project.stakeholders.length === 0 && <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucune partie prenante</p>}
                  {project.stakeholders.map(s => (
                    <div key={s.id} className="px-5 py-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.role} · {s.organization}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.influence === 'FORT' ? 'bg-red-100 text-red-700' : s.influence === 'MOYEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            Influence {s.influence}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.interest === 'FORT' ? 'bg-blue-100 text-blue-700' : s.interest === 'MOYEN' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>
                            Intérêt {s.interest}
                          </span>
                        </div>
                      </div>
                      {s.notes && <p className="text-xs text-gray-400 mt-1">{s.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COMMENTAIRES ── */}
        {tab === 'commentaires' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800">Commentaires & Notes</h2>
              <button onClick={() => setCommentModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#003087] text-white rounded-lg text-sm hover:bg-blue-800">
                <Plus size={14} /> Nouveau commentaire
              </button>
            </div>
            {project.comments.length === 0 && (
              <div className="bg-white rounded-xl border p-12 text-center">
                <p className="text-gray-400 text-sm">Aucun commentaire.</p>
              </div>
            )}
            <div className="space-y-3">
              {[...project.comments].sort((a, b) => b.date.localeCompare(a.date)).map(c => (
                <div key={c.id} className={`bg-white rounded-xl border p-5 ${c.type === 'IMPORTANT' ? 'border-l-4 border-l-orange-400' : c.type === 'DECISION' ? 'border-l-4 border-l-purple-400' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#003087] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {c.author.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.author}</p>
                        <p className="text-xs text-gray-400">{fmt(c.date, 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === 'IMPORTANT' ? 'bg-orange-100 text-orange-700' : c.type === 'DECISION' ? 'bg-purple-100 text-purple-700' : c.type === 'QUESTION' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.type === 'IMPORTANT' ? 'Important' : c.type === 'DECISION' ? 'Décision' : c.type === 'QUESTION' ? 'Question' : 'Général'}
                      </span>
                      <button onClick={() => save({ ...project, comments: project.comments.filter(cm => cm.id !== c.id) })}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      <JournalModal open={journalModal || !!editingJournal} onClose={() => { setJournalModal(false); setEditingJournal(null); }}
        initial={editingJournal}
        onSave={(entry) => {
          const updated = { ...project };
          if (editingJournal) {
            updated.journal = updated.journal.map(j => j.id === entry.id ? entry : j);
          } else {
            updated.journal = [entry, ...updated.journal];
          }
          save(updated);
          setJournalModal(false); setEditingJournal(null);
        }} />

      <RiskModal open={riskModal || !!editingRisk} onClose={() => { setRiskModal(false); setEditingRisk(null); }}
        initial={editingRisk}
        onSave={(risk) => {
          const updated = { ...project };
          if (editingRisk) {
            updated.risks = updated.risks.map(r => r.id === risk.id ? risk : r);
          } else {
            updated.risks = [...updated.risks, risk];
          }
          save(updated);
          setRiskModal(false); setEditingRisk(null);
        }} />

      <CommentModal open={commentModal} onClose={() => setCommentModal(false)}
        onSave={(comment) => {
          save({ ...project, comments: [comment, ...project.comments] });
          setCommentModal(false);
        }} />

      <MilestoneModal open={milestoneModal} onClose={() => setMilestoneModal(false)}
        order={project.milestones.length + 1}
        onSave={(ms) => {
          save({ ...project, milestones: [...project.milestones, ms] });
          setMilestoneModal(false);
        }} />

      {taskModal && (
        <TaskModalComp open={!!taskModal} onClose={() => setTaskModal(null)}
          milestoneId={taskModal.milestoneId}
          onSave={(task) => {
            const updated = { ...project };
            const m = updated.milestones.find(m => m.id === taskModal.milestoneId)!;
            m.tasks = [...m.tasks, task];
            save(updated);
            setTaskModal(null);
          }} />
      )}
    </AppLayout>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 ${className}`}>{value || '—'}</p>
    </div>
  );
}

function TextBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}

function TaskRow({ task, onStatusChange }: { task: Task; onStatusChange: (s: Task['status']) => void }) {
  return (
    <div className="px-5 py-3 flex items-center gap-4 text-sm hover:bg-gray-50">
      <select value={task.status} onChange={e => onStatusChange(e.target.value as Task['status'])}
        className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
        {(Object.keys(TASK_STATUS_LABELS) as Task['status'][]).map(s => (
          <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
        ))}
      </select>
      <div className="flex-1 min-w-0">
        <span className={task.status === 'TERMINE' ? 'line-through text-gray-400' : 'text-gray-800'}>{task.name}</span>
        {task.assignedTo.length > 0 && <span className="text-xs text-gray-400 ml-2">{task.assignedTo.join(', ')}</span>}
      </div>
      <span className={`text-xs flex-shrink-0 ${isOverdue(task.plannedDate) && task.status !== 'TERMINE' ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
        {fmt(task.plannedDate)}
      </span>
      <div className="w-20 flex-shrink-0">
        <ProgressBar value={task.progress} size="sm" showLabel />
      </div>
    </div>
  );
}

function fmtAmount(n: number, currency: string) {
  return n.toLocaleString('fr-FR') + ' ' + currency;
}

// ── Modal forms ───────────────────────────────────────────────────────────────

function JournalModal({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (e: JournalEntry) => void; initial: JournalEntry | null }) {
  const blank: JournalEntry = { id: newId(), date: new Date().toISOString().split('T')[0], type: 'REUNION', title: '', description: '', participants: [], actionItems: [], author: 'Nadrey BOA' };
  const [form, setForm] = useState<JournalEntry>(initial ?? blank);
  const [participantInput, setParticipantInput] = useState('');
  const [newAction, setNewAction] = useState({ description: '', assignedTo: '', dueDate: '' });

  useEffect(() => { setForm(initial ?? blank); setParticipantInput(''); }, [open, initial]);

  function addParticipant() {
    if (!participantInput.trim()) return;
    setForm(f => ({ ...f, participants: [...f.participants, participantInput.trim()] }));
    setParticipantInput('');
  }

  function addAction() {
    if (!newAction.description.trim()) return;
    const action: ActionItem = { id: newId(), ...newAction, status: 'OUVERT' };
    setForm(f => ({ ...f, actionItems: [...f.actionItems, action] }));
    setNewAction({ description: '', assignedTo: '', dueDate: '' });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier l\'entrée' : 'Nouvelle entrée journal'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as JournalEntry['type'] }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(JOURNAL_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Titre *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Titre de l'événement" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Compte-rendu, décisions prises, points discutés..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Lieu</label>
            <input value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Salle de réunion, visio..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Prochaine réunion</label>
            <input type="date" value={form.nextMeetingDate ?? ''} onChange={e => setForm(f => ({ ...f, nextMeetingDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Participants</label>
          <div className="flex gap-2 mb-2">
            <input value={participantInput} onChange={e => setParticipantInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addParticipant())} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nom du participant" />
            <button onClick={addParticipant} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"><Plus size={14} /></button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.participants.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {p} <button onClick={() => setForm(f => ({ ...f, participants: f.participants.filter((_, j) => j !== i) }))}><X size={11} /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Actions / Points de suivi</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input value={newAction.description} onChange={e => setNewAction(a => ({ ...a, description: e.target.value }))} className="col-span-1 border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Description de l'action" />
            <input value={newAction.assignedTo} onChange={e => setNewAction(a => ({ ...a, assignedTo: e.target.value }))} className="border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Responsable" />
            <div className="flex gap-1">
              <input type="date" value={newAction.dueDate} onChange={e => setNewAction(a => ({ ...a, dueDate: e.target.value }))} className="flex-1 border rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addAction} className="px-2 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus size={13} /></button>
            </div>
          </div>
          <div className="space-y-1">
            {form.actionItems.map((a, i) => (
              <div key={a.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-xs">
                <span className="flex-1 font-medium">{a.description}</span>
                <span className="text-gray-500">{a.assignedTo}</span>
                <span className="text-gray-400">{fmt(a.dueDate)}</span>
                <button onClick={() => setForm(f => ({ ...f, actionItems: f.actionItems.filter((_, j) => j !== i) }))}><X size={11} className="text-gray-400 hover:text-red-500" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
          <button onClick={() => form.title && onSave(form)} disabled={!form.title} className="px-4 py-2 text-sm bg-[#003087] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">
            {initial ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RiskModal({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (r: Risk) => void; initial: Risk | null }) {
  const blank: Risk = { id: newId(), title: '', description: '', category: 'TECHNIQUE', probability: 'MOYEN', impact: 'MOYEN', score: 4, status: 'IDENTIFIE', mitigation: '', contingency: '', owner: '', identifiedDate: new Date().toISOString().split('T')[0] };
  const [form, setForm] = useState<Risk>(initial ?? blank);

  useEffect(() => { setForm(initial ?? blank); }, [open, initial]);

  function update(field: keyof Risk, value: string) {
    setForm(f => {
      const updated = { ...f, [field]: value };
      if (field === 'probability' || field === 'impact') {
        updated.score = computeRiskScore(updated.probability, updated.impact);
      }
      return updated;
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier le risque' : 'Nouveau risque'} size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Titre du risque *</label>
          <input value={form.title} onChange={e => update('title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Retard homologation réglementaire" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea rows={2} value={form.description} onChange={e => update('description', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
            <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['TECHNIQUE','ORGANISATIONNEL','FINANCIER','REGLEMENTAIRE','CALENDAIRE','SECURITE','AUTRE'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Probabilité</label>
            <select value={form.probability} onChange={e => update('probability', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="FAIBLE">Faible</option><option value="MOYEN">Moyen</option><option value="ELEVE">Élevé</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Impact</label>
            <select value={form.impact} onChange={e => update('impact', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="FAIBLE">Faible</option><option value="MOYEN">Moyen</option><option value="ELEVE">Élevé</option><option value="CRITIQUE">Critique</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold ${form.score >= 9 ? 'bg-red-100 text-red-700' : form.score >= 6 ? 'bg-orange-100 text-orange-700' : form.score >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
            {form.score}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Score de risque calculé</p>
            <p className="text-xs text-gray-400">Probabilité × Impact = {form.score} / 12 · Niveau : {riskLevel(form.score)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
            <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="IDENTIFIE">Identifié</option><option value="EN_COURS">En cours</option><option value="MITIGE">Mitigé</option><option value="REALISE">Réalisé</option><option value="CLOS">Clos</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Responsable</label>
            <input value={form.owner} onChange={e => update('owner', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nom du responsable" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Plan de mitigation</label>
          <textarea rows={2} value={form.mitigation} onChange={e => update('mitigation', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Actions pour réduire la probabilité ou l'impact..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Plan de contingence</label>
          <textarea rows={2} value={form.contingency} onChange={e => update('contingency', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Que faire si le risque se réalise..." />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
          <button onClick={() => form.title && onSave(form)} disabled={!form.title} className="px-4 py-2 text-sm bg-[#003087] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">
            {initial ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CommentModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (c: Comment) => void }) {
  const [form, setForm] = useState({ content: '', type: 'GENERAL' as Comment['type'], author: 'Nadrey BOA' });
  useEffect(() => { if (open) setForm({ content: '', type: 'GENERAL', author: 'Nadrey BOA' }); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Nouveau commentaire" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Auteur</label>
            <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Comment['type'] }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="GENERAL">Général</option><option value="IMPORTANT">Important</option><option value="QUESTION">Question</option><option value="DECISION">Décision</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Commentaire *</label>
          <textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Votre commentaire..." />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
          <button onClick={() => form.content && onSave({ id: newId(), date: new Date().toISOString(), ...form })} disabled={!form.content} className="px-4 py-2 text-sm bg-[#003087] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">Ajouter</button>
        </div>
      </div>
    </Modal>
  );
}

function MilestoneModal({ open, onClose, onSave, order }: { open: boolean; onClose: () => void; onSave: (ms: Milestone) => void; order: number }) {
  const blank: Milestone = { id: newId(), order, name: '', description: '', plannedDate: '', status: 'NON_COMMENCE', tasks: [], responsible: '', deliverables: [], weight: 5 };
  const [form, setForm] = useState(blank);
  const [delivInput, setDelivInput] = useState('');
  useEffect(() => { if (open) setForm({ ...blank, id: newId() }); setDelivInput(''); }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Nouveau jalon" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nom du jalon *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Phase 1 – Conception" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date prévue *</label>
            <input type="date" value={form.plannedDate} onChange={e => setForm(f => ({ ...f, plannedDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Responsable</label>
            <input value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Poids (importance 1–10)</label>
          <input type="range" min={1} max={10} value={form.weight} onChange={e => setForm(f => ({ ...f, weight: +e.target.value }))} className="w-full" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Faible (1)</span><span className="font-medium text-gray-700">Poids : {form.weight}</span><span>Fort (10)</span></div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Livrables</label>
          <div className="flex gap-2 mb-2">
            <input value={delivInput} onChange={e => setDelivInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (delivInput.trim()) { setForm(f => ({ ...f, deliverables: [...f.deliverables, delivInput.trim()] })); setDelivInput(''); } } }} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nom du livrable" />
            <button onClick={() => { if (delivInput.trim()) { setForm(f => ({ ...f, deliverables: [...f.deliverables, delivInput.trim()] })); setDelivInput(''); } }} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus size={14} /></button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.deliverables.map((d, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                {d} <button onClick={() => setForm(f => ({ ...f, deliverables: f.deliverables.filter((_, j) => j !== i) }))}><X size={11} /></button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
          <button onClick={() => form.name && form.plannedDate && onSave(form)} disabled={!form.name || !form.plannedDate} className="px-4 py-2 text-sm bg-[#003087] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">Créer le jalon</button>
        </div>
      </div>
    </Modal>
  );
}

function TaskModalComp({ open, onClose, onSave, milestoneId }: { open: boolean; onClose: () => void; onSave: (t: Task) => void; milestoneId: string }) {
  const blank: Task = { id: newId(), milestoneId, name: '', plannedDate: '', status: 'A_FAIRE', assignedTo: [], priority: 'MOYENNE', estimatedDays: 1, dependencies: [], progress: 0 };
  const [form, setForm] = useState(blank);
  const [assignee, setAssignee] = useState('');
  useEffect(() => { if (open) setForm({ ...blank, id: newId() }); setAssignee(''); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Nouvelle tâche" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nom de la tâche *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Rédiger le cahier des charges" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea rows={2} value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date prévue *</label>
            <input type="date" value={form.plannedDate} onChange={e => setForm(f => ({ ...f, plannedDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Priorité</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="HAUTE">Haute</option><option value="MOYENNE">Moyenne</option><option value="BASSE">Basse</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Jours estimés</label>
            <input type="number" min={0.5} step={0.5} value={form.estimatedDays} onChange={e => setForm(f => ({ ...f, estimatedDays: +e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Personnes assignées</label>
          <div className="flex gap-2 mb-2">
            <input value={assignee} onChange={e => setAssignee(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (assignee.trim()) { setForm(f => ({ ...f, assignedTo: [...f.assignedTo, assignee.trim()] })); setAssignee(''); } } }} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nom de la personne" />
            <button onClick={() => { if (assignee.trim()) { setForm(f => ({ ...f, assignedTo: [...f.assignedTo, assignee.trim()] })); setAssignee(''); } }} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus size={14} /></button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.assignedTo.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {a} <button onClick={() => setForm(f => ({ ...f, assignedTo: f.assignedTo.filter((_, j) => j !== i) }))}><X size={11} /></button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Avancement initial (%)</label>
          <input type="range" min={0} max={100} step={5} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: +e.target.value }))} className="w-full" />
          <span className="text-xs text-gray-500">{form.progress}%</span>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
          <button onClick={() => form.name && form.plannedDate && onSave(form)} disabled={!form.name || !form.plannedDate} className="px-4 py-2 text-sm bg-[#003087] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">Créer la tâche</button>
        </div>
      </div>
    </Modal>
  );
}
