'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { upsertProject, loadProjects } from '@/lib/storage';
import { Project } from '@/lib/types';
import { generateProjectCode, newId, CATEGORY_LABELS } from '@/lib/utils';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<Partial<Project>>({
    id: newId(),
    code: generateProjectCode(loadProjects()),
    name: '',
    description: '',
    category: 'MONÉTIQUE',
    status: 'PLANIFIE',
    priority: 'MOYENNE',
    healthStatus: 'VERT',
    progress: 0,
    startDate: '',
    plannedEndDate: '',
    plannedDurationDays: 0,
    projectManager: '',
    sponsor: '',
    objectives: '',
    scope: '',
    outOfScope: '',
    successCriteria: '',
    assumptions: '',
    constraints: '',
    interProjectDependencies: '',
    team: [],
    stakeholders: [],
    milestones: [],
    risks: [],
    journal: [],
    comments: [],
    budget: { currency: 'MAD', totalEstimated: 0, totalActual: 0, lines: [] },
    tags: [],
  });

  function set(field: keyof Project, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function addTag() {
    if (!tagInput.trim()) return;
    set('tags', [...(form.tags ?? []), tagInput.trim()]);
    setTagInput('');
  }

  function handleSave() {
    if (!form.name || !form.startDate || !form.plannedEndDate) return;
    setSaving(true);
    const project: Project = {
      ...(form as Project),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertProject(project);
    router.push(`/projects/${project.id}`);
  }

  const isValid = form.name && form.startDate && form.plannedEndDate && form.projectManager;

  return (
    <AppLayout>
      <div className="bg-white border-b px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft size={15} /> Projets
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Nouveau projet</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/projects" className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</Link>
          <button onClick={handleSave} disabled={!isValid || saving}
            className="px-4 py-2 text-sm bg-[#003087] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 font-medium">
            {saving ? 'Enregistrement…' : 'Créer le projet'}
          </button>
        </div>
      </div>

      <div className="p-8 max-w-4xl">
        <div className="space-y-6">
          {/* Identification */}
          <Section title="Identification">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Code projet" hint="Auto-généré">
                <input value={form.code} onChange={e => set('code', e.target.value)} className={input()} />
              </Field>
              <Field label="Catégorie">
                <select value={form.category} onChange={e => set('category', e.target.value)} className={input()}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Nom du projet *">
              <input value={form.name} onChange={e => set('name', e.target.value)} className={input()} placeholder="Ex: Déploiement TPE Nouvelle Génération" />
            </Field>
            <Field label="Description">
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className={`${input()} resize-none`} placeholder="Présentation synthétique du projet..." />
            </Field>
          </Section>

          {/* Statut & Priorité */}
          <Section title="Statut & Priorité">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Statut">
                <select value={form.status} onChange={e => set('status', e.target.value)} className={input()}>
                  <option value="BROUILLON">Brouillon</option>
                  <option value="PLANIFIE">Planifié</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="EN_PAUSE">En pause</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </Field>
              <Field label="Priorité">
                <select value={form.priority} onChange={e => set('priority', e.target.value)} className={input()}>
                  <option value="CRITIQUE">Critique</option>
                  <option value="HAUTE">Haute</option>
                  <option value="MOYENNE">Moyenne</option>
                  <option value="BASSE">Basse</option>
                </select>
              </Field>
              <Field label="Santé du projet">
                <select value={form.healthStatus} onChange={e => set('healthStatus', e.target.value)} className={input()}>
                  <option value="VERT">🟢 Sain</option>
                  <option value="ORANGE">🟠 À surveiller</option>
                  <option value="ROUGE">🔴 En danger</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Dates */}
          <Section title="Calendrier">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Date de début *">
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={input()} />
              </Field>
              <Field label="Date de fin prévue *">
                <input type="date" value={form.plannedEndDate} onChange={e => set('plannedEndDate', e.target.value)} className={input()} />
              </Field>
              <Field label="Durée prévue (jours)">
                <input type="number" min={0} value={form.plannedDurationDays || ''} onChange={e => set('plannedDurationDays', +e.target.value)} className={input()} placeholder="Ex: 180" />
              </Field>
            </div>
          </Section>

          {/* Équipe */}
          <Section title="Équipe">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Chef de projet *">
                <input value={form.projectManager} onChange={e => set('projectManager', e.target.value)} className={input()} placeholder="Nom du chef de projet" />
              </Field>
              <Field label="Sponsor">
                <input value={form.sponsor} onChange={e => set('sponsor', e.target.value)} className={input()} placeholder="Nom du sponsor" />
              </Field>
            </div>
          </Section>

          {/* Cadrage */}
          <Section title="Cadrage du projet">
            <Field label="Objectifs">
              <textarea rows={3} value={form.objectives} onChange={e => set('objectives', e.target.value)} className={`${input()} resize-none`} placeholder="Objectifs du projet..." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Périmètre (in-scope)">
                <textarea rows={2} value={form.scope} onChange={e => set('scope', e.target.value)} className={`${input()} resize-none`} placeholder="Ce qui est dans le périmètre..." />
              </Field>
              <Field label="Hors périmètre">
                <textarea rows={2} value={form.outOfScope} onChange={e => set('outOfScope', e.target.value)} className={`${input()} resize-none`} placeholder="Ce qui est explicitement exclu..." />
              </Field>
            </div>
            <Field label="Critères de succès">
              <textarea rows={2} value={form.successCriteria} onChange={e => set('successCriteria', e.target.value)} className={`${input()} resize-none`} placeholder="Comment mesurer le succès du projet..." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hypothèses">
                <textarea rows={2} value={form.assumptions} onChange={e => set('assumptions', e.target.value)} className={`${input()} resize-none`} placeholder="Hypothèses de travail..." />
              </Field>
              <Field label="Contraintes">
                <textarea rows={2} value={form.constraints} onChange={e => set('constraints', e.target.value)} className={`${input()} resize-none`} placeholder="Contraintes identifiées..." />
              </Field>
            </div>
            <Field label="Dépendances inter-projets">
              <input value={form.interProjectDependencies} onChange={e => set('interProjectDependencies', e.target.value)} className={input()} placeholder="Ex: PRJ-2024-003 (Infrastructure réseau)" />
            </Field>
          </Section>

          {/* Budget */}
          <Section title="Budget">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Budget estimé">
                <input type="number" min={0} value={form.budget?.totalEstimated || ''} onChange={e => set('budget', { ...form.budget, totalEstimated: +e.target.value, totalActual: form.budget?.totalActual ?? 0, currency: form.budget?.currency ?? 'MAD', lines: form.budget?.lines ?? [] })} className={input()} placeholder="0" />
              </Field>
              <Field label="Devise">
                <select value={form.budget?.currency} onChange={e => set('budget', { ...form.budget, currency: e.target.value })} className={input()}>
                  <option value="MAD">MAD (Dirham marocain)</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="XOF">XOF (Franc CFA)</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Tags */}
          <Section title="Tags">
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className={input()} placeholder="Ajouter un tag (Entrée pour valider)" />
              <button onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.tags ?? []).map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {tag}
                  <button onClick={() => set('tags', (form.tags ?? []).filter((_, j) => j !== i))}><X size={13} /></button>
                </span>
              ))}
            </div>
          </Section>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link href="/projects" className="px-5 py-2.5 text-sm border rounded-lg hover:bg-gray-50">Annuler</Link>
            <button onClick={handleSave} disabled={!isValid || saving}
              className="px-5 py-2.5 text-sm bg-[#003087] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 font-medium">
              {saving ? 'Enregistrement…' : 'Créer le projet'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function input() {
  return 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {hint && <span className="font-normal text-gray-400">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
