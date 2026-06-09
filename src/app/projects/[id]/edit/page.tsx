'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getProject, upsertProject } from '@/lib/storage';
import { Project } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/utils';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Project | null>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const p = getProject(id);
    if (!p) router.push('/projects');
    else setForm(p);
  }, [id, router]);

  if (!form) return <AppLayout><div className="flex items-center justify-center h-64"><p className="text-gray-400">Chargement…</p></div></AppLayout>;

  function set(field: keyof Project, value: unknown) {
    setForm(f => f ? { ...f, [field]: value } : null);
  }

  function addTag() {
    if (!tagInput.trim()) return;
    set('tags', [...form!.tags, tagInput.trim()]);
    setTagInput('');
  }

  function handleSave() {
    if (!form) return;
    upsertProject(form);
    router.push(`/projects/${form.id}`);
  }

  return (
    <AppLayout>
      <div className="bg-white border-b px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${id}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft size={15} /> Retour
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Modifier – {form.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/projects/${id}`} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</Link>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-[#1B7A4B] text-white rounded-lg hover:bg-[#145c38] font-medium">Enregistrer</button>
        </div>
      </div>

      <div className="p-8 max-w-4xl">
        <div className="space-y-6">
          <Section title="Identification">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Code projet"><input value={form.code} onChange={e => set('code', e.target.value)} className={inp()} /></Field>
              <Field label="Catégorie">
                <select value={form.category} onChange={e => set('category', e.target.value)} className={inp()}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Nom du projet *"><input value={form.name} onChange={e => set('name', e.target.value)} className={inp()} /></Field>
            <Field label="Description"><textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className={`${inp()} resize-none`} /></Field>
          </Section>

          <Section title="Statut & Priorité">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Statut">
                <select value={form.status} onChange={e => set('status', e.target.value)} className={inp()}>
                  <option value="BROUILLON">Brouillon</option><option value="PLANIFIE">Planifié</option>
                  <option value="EN_COURS">En cours</option><option value="EN_PAUSE">En pause</option>
                  <option value="TERMINE">Terminé</option><option value="ANNULE">Annulé</option>
                </select>
              </Field>
              <Field label="Priorité">
                <select value={form.priority} onChange={e => set('priority', e.target.value)} className={inp()}>
                  <option value="CRITIQUE">Critique</option><option value="HAUTE">Haute</option>
                  <option value="MOYENNE">Moyenne</option><option value="BASSE">Basse</option>
                </select>
              </Field>
              <Field label="Santé">
                <select value={form.healthStatus} onChange={e => set('healthStatus', e.target.value)} className={inp()}>
                  <option value="VERT">🟢 Sain</option><option value="ORANGE">🟠 À surveiller</option><option value="ROUGE">🔴 En danger</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Calendrier">
            <div className="grid grid-cols-4 gap-4">
              <Field label="Date de début"><input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inp()} /></Field>
              <Field label="Fin prévue"><input type="date" value={form.plannedEndDate} onChange={e => set('plannedEndDate', e.target.value)} className={inp()} /></Field>
              <Field label="Fin réelle"><input type="date" value={form.actualEndDate ?? ''} onChange={e => set('actualEndDate', e.target.value || undefined)} className={inp()} /></Field>
              <Field label="Durée (jours)"><input type="number" value={form.plannedDurationDays || ''} onChange={e => set('plannedDurationDays', +e.target.value)} className={inp()} /></Field>
            </div>
          </Section>

          <Section title="Équipe">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Chef de projet"><input value={form.projectManager} onChange={e => set('projectManager', e.target.value)} className={inp()} /></Field>
              <Field label="Sponsor"><input value={form.sponsor} onChange={e => set('sponsor', e.target.value)} className={inp()} /></Field>
            </div>
          </Section>

          <Section title="Cadrage du projet">
            <Field label="Objectifs"><textarea rows={3} value={form.objectives} onChange={e => set('objectives', e.target.value)} className={`${inp()} resize-none`} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Périmètre"><textarea rows={2} value={form.scope} onChange={e => set('scope', e.target.value)} className={`${inp()} resize-none`} /></Field>
              <Field label="Hors périmètre"><textarea rows={2} value={form.outOfScope} onChange={e => set('outOfScope', e.target.value)} className={`${inp()} resize-none`} /></Field>
            </div>
            <Field label="Critères de succès"><textarea rows={2} value={form.successCriteria} onChange={e => set('successCriteria', e.target.value)} className={`${inp()} resize-none`} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hypothèses"><textarea rows={2} value={form.assumptions} onChange={e => set('assumptions', e.target.value)} className={`${inp()} resize-none`} /></Field>
              <Field label="Contraintes"><textarea rows={2} value={form.constraints} onChange={e => set('constraints', e.target.value)} className={`${inp()} resize-none`} /></Field>
            </div>
            <Field label="Dépendances inter-projets"><input value={form.interProjectDependencies} onChange={e => set('interProjectDependencies', e.target.value)} className={inp()} /></Field>
          </Section>

          <Section title="Budget">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Budget estimé"><input type="number" value={form.budget.totalEstimated || ''} onChange={e => set('budget', { ...form.budget, totalEstimated: +e.target.value })} className={inp()} /></Field>
              <Field label="Dépensé"><input type="number" value={form.budget.totalActual || ''} onChange={e => set('budget', { ...form.budget, totalActual: +e.target.value })} className={inp()} /></Field>
              <Field label="Devise">
                <select value={form.budget.currency} onChange={e => set('budget', { ...form.budget, currency: e.target.value })} className={inp()}>
                  <option value="MAD">MAD</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="XOF">XOF</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Tags">
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className={inp()} placeholder="Ajouter un tag" />
              <button onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e8ecf5] text-[#1B2E5E] rounded-full text-sm font-medium">
                  {tag} <button onClick={() => set('tags', form.tags.filter((_, j) => j !== i))}><X size={13} /></button>
                </span>
              ))}
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link href={`/projects/${id}`} className="px-5 py-2.5 text-sm border rounded-lg hover:bg-gray-50">Annuler</Link>
            <button onClick={handleSave} className="px-5 py-2.5 text-sm bg-[#1B7A4B] text-white rounded-lg hover:bg-[#145c38] font-medium">Enregistrer les modifications</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function inp() { return 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A4B] bg-white'; }
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border p-6 space-y-4"><h2 className="text-sm font-semibold text-gray-700 border-b pb-2">{title}</h2>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
}
