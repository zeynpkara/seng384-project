import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { posts } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const PROJECT_STAGES = [
  { value: 'IDEA', label: 'Idea' },
  { value: 'CONCEPT_VALIDATION', label: 'Concept Validation' },
  { value: 'PROTOTYPE', label: 'Prototype' },
  { value: 'PILOT_TESTING', label: 'Pilot Testing' },
  { value: 'PRE_DEPLOYMENT', label: 'Pre-Deployment' },
] as const;

const COMMITMENT_OPTIONS = [
  '5 hours/week',
  '10 hours/week',
  '20 hours/week',
  'Full-time 3 months',
  'Full-time 6 months',
];

export default function PostCreateModal({ isOpen, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    title: '',
    domain: '',
    description: '',
    requiredExpertise: '',
    projectStage: 'IDEA' as string,
    confidentiality: 'PUBLIC' as 'PUBLIC' | 'MEETING_ONLY',
    city: '',
    country: '',
    commitmentLevel: '10 hours/week',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'draft' | 'publish' | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (publish: boolean) => {
    setError('');
    setLoading(publish ? 'publish' : 'draft');
    try {
      const created = await posts.createPost(form) as { id: string };
      if (publish) {
        await posts.publishPost(created.id);
      }
      onCreated();
      onClose();
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(null);
    }
  };

  const resetForm = () => {
    setForm({ title: '', domain: '', description: '', requiredExpertise: '', projectStage: 'IDEA', confidentiality: 'PUBLIC', city: '', country: '', commitmentLevel: '10 hours/week' });
    setError('');
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors';
  const labelClass = 'block text-[11px] text-white/40 uppercase tracking-widest mb-1';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-panel p-6 md:p-8 rounded-2xl w-full max-w-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl text-white font-bold mb-1">Create Post</h2>
                <p className="text-white/40 text-sm">Describe your collaboration need</p>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors shrink-0"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. AI-Powered ECG Anomaly Detection" className={inputClass} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Domain *</label>
                  <input type="text" value={form.domain} onChange={set('domain')} placeholder="e.g. Cardiology" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Project Stage *</label>
                  <select value={form.projectStage} onChange={set('projectStage')} className={inputClass}>
                    {PROJECT_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <textarea value={form.description} onChange={set('description')} placeholder="Describe the problem, what you need, and why it matters clinically..." className={`${inputClass} resize-none h-24`} required />
              </div>

              <div>
                <label className={labelClass}>Required Expertise *</label>
                <input type="text" value={form.requiredExpertise} onChange={set('requiredExpertise')} placeholder="e.g. Machine Learning, Signal Processing, Python" className={inputClass} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City *</label>
                  <input type="text" value={form.city} onChange={set('city')} placeholder="e.g. Ankara" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Country *</label>
                  <input type="text" value={form.country} onChange={set('country')} placeholder="e.g. Turkey" className={inputClass} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Commitment Level *</label>
                  <select value={form.commitmentLevel} onChange={set('commitmentLevel')} className={inputClass}>
                    {COMMITMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Confidentiality *</label>
                  <select value={form.confidentiality} onChange={e => setForm(f => ({ ...f, confidentiality: e.target.value as 'PUBLIC' | 'MEETING_ONLY' }))} className={inputClass}>
                    <option value="PUBLIC">Public</option>
                    <option value="MEETING_ONLY">Meeting Only</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={!!loading}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-lg font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading === 'draft' && <Loader2 size={14} className="animate-spin" />}
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={!!loading}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading === 'publish' && <Loader2 size={14} className="animate-spin" />}
                  Publish
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
