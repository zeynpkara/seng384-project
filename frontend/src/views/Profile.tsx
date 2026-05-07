import React, { useState, useEffect } from 'react';
import { Save, Download, Trash2, X, Loader2, ShieldCheck, User } from 'lucide-react';
import { profile as profileApi, downloadFile } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface UserData {
  id: string; email: string; role: string; name: string;
  institution: string; ndaAcceptedAt: string | null; createdAt: string;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    profileApi.getProfile().then(d => {
      const u = d as UserData;
      setData(u);
      setName(u.name);
      setInstitution(u.institution);
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await profileApi.updateProfile({ name, institution });
      setSaveMsg('Profile updated successfully.');
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/api/users/me/export', 'healthai-data-export.json');
    } catch { /* silent */ } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await profileApi.deleteAccount(deletePassword);
      logout();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Deletion failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors';
  const labelClass = 'block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold';
  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const accent = user?.role === 'HEALTHCARE' ? 'clinical-green' : user?.role === 'ENGINEER' ? 'tech-navy' : 'system-red';
  const roleLabel = user?.role === 'HEALTHCARE' ? 'HEALTHCARE PROFILE' : user?.role === 'ENGINEER' ? 'ENGINEER PROFILE' : 'ADMIN PROFILE';

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full bg-${accent}/20 border-2 border-${accent}/40 flex items-center justify-center text-xl font-bold text-${accent}`}>
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full bg-${accent} animate-pulse`} />
            <p className={`text-[10px] text-${accent} tracking-widest uppercase font-bold`}>{roleLabel}</p>
          </div>
          <h1 className="text-2xl md:text-3xl text-white font-bold">{data?.name ?? user?.name}</h1>
          <p className="text-white/40 text-sm">{data?.email ?? user?.email}</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass-panel rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <User size={18} className="text-white/40" />
          <h2 className="text-white font-semibold">Profile Information</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Institution</label>
              <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} className={inputClass} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Email (read-only)</label>
              <input type="email" value={data?.email ?? ''} className={`${inputClass} opacity-40 cursor-not-allowed`} readOnly />
            </div>
            <div>
              <label className={labelClass}>Role (read-only)</label>
              <input type="text" value={data?.role ?? ''} className={`${inputClass} opacity-40 cursor-not-allowed`} readOnly />
            </div>
          </div>

          {data?.ndaAcceptedAt && (
            <div className="flex items-center gap-2 text-clinical-green text-xs bg-clinical-green/10 border border-clinical-green/20 rounded-lg px-4 py-3">
              <ShieldCheck size={15} />
              <span>NDA accepted on {new Date(data.ndaAcceptedAt).toLocaleDateString()}</span>
            </div>
          )}
          {!data?.ndaAcceptedAt && user?.role !== 'ADMIN' && (
            <div className="flex items-center gap-2 text-yellow-400 text-xs bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-4 py-3">
              <ShieldCheck size={15} />
              <span>NDA has not been accepted yet. It will be requested the first time you express interest in a post.</span>
            </div>
          )}

          {saveMsg && (
            <p className={`text-xs rounded-lg px-3 py-2 border ${saveMsg.includes('success') ? 'text-clinical-green bg-clinical-green/10 border-clinical-green/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
              {saveMsg}
            </p>
          )}

          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </form>
      </div>

      {/* GDPR Section */}
      <div className="glass-panel rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <ShieldCheck size={18} className="text-white/40" />
          <h2 className="text-white font-semibold">Data & Privacy (GDPR)</h2>
        </div>

        {/* Export Data */}
        <div className="flex items-center justify-between p-4 glass-panel-elevated rounded-xl">
          <div>
            <p className="text-white text-sm font-semibold">Export My Data</p>
            <p className="text-white/40 text-xs mt-0.5">Download all your data as JSON</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Export
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-4 bg-system-red/5 border border-system-red/20 rounded-xl">
          <div>
            <p className="text-system-red text-sm font-semibold">Delete Account</p>
            <p className="text-white/40 text-xs mt-0.5">Permanent — this cannot be undone</p>
          </div>
          <button
            onClick={() => setDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-system-red/10 text-system-red border border-system-red/30 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-system-red hover:text-white transition-all"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteModal(false)} />
          <div className="relative glass-panel p-8 rounded-2xl w-full max-w-md border border-system-red/30 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-white font-bold text-lg">Delete Account</h2>
                <p className="text-white/40 text-sm mt-1">This action is permanent and cannot be undone.</p>
              </div>
              <button onClick={() => setDeleteModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <div className="bg-system-red/10 border border-system-red/20 rounded-lg p-4 text-xs text-system-red leading-relaxed">
              Your posts, meeting requests and personal data will be anonymised. ACTIVE posts remain visible with "Deleted User" as owner.
            </div>

            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label className={labelClass}>Enter your password to confirm</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Current password"
                  className={inputClass}
                  required
                />
              </div>
              {deleteError && (
                <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setDeleteModal(false)} className="flex-1 py-3 bg-white/5 text-white/50 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={deleteLoading} className="flex-1 py-3 bg-system-red text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleteLoading && <Loader2 size={12} className="animate-spin" />}
                  Delete Permanently
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
