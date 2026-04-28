import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Clock, Check, X, GraduationCap,
  ShieldAlert, Server, Download, Loader2,
  ShieldOff, Trash2, RefreshCw,
} from 'lucide-react';
import { admin as adminApi, downloadFile } from '../api/client';

interface AdminUser {
  id: string; email: string; role: string; name: string;
  institution: string; isVerified: boolean; isSuspended: boolean; createdAt: string;
}

interface AdminPost {
  id: string; title: string; domain: string; status: string; createdAt: string;
  owner: { id: string; name: string; email: string };
}

interface LogEntry {
  id: string; action: string; userId: string | null; createdAt: string;
  entity: string | null; entityId: string | null; ipAddress: string | null;
  user: { email: string } | null;
}

function StatCard({ icon: Icon, count, label, badge, badgeCls, borderCls }: {
  icon: React.ElementType; count: number | string; label: string;
  badge: string; badgeCls: string; borderCls?: string;
}) {
  return (
    <div className={`glass-panel p-6 rounded-xl flex flex-col justify-between h-40 ${borderCls ?? ''}`}>
      <div className="flex justify-between items-start">
        <Icon className="text-white/40" size={24} />
        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${badgeCls}`}>{badge}</span>
      </div>
      <div>
        <p className="text-4xl font-bold text-white leading-none">{count}</p>
        <p className="text-xs text-white/50 mt-2 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

export default function SystemAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [userFilter, setUserFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, p, l] = await Promise.all([
        adminApi.getUsers() as Promise<AdminUser[]>,
        adminApi.getPosts() as Promise<AdminPost[]>,
        adminApi.getLogs({ limit: '10' }) as Promise<{ logs: LogEntry[] }>,
      ]);
      setUsers(u);
      setPosts(p);
      setLogs(l.logs ?? []);
    } catch {
      // graceful — no DB
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSuspendUser = async (id: string) => {
    try {
      await adminApi.suspendUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isSuspended: true } : u));
    } catch { /* silent */ }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Remove this post from the platform?')) return;
    try {
      await adminApi.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch { /* silent */ }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      await downloadFile('/api/admin/logs/export', 'health-ai-audit.csv');
    } catch { /* silent */ } finally {
      setExportingCsv(false);
    }
  };

  const totalUsers = users.length;
  const activeNdas = users.filter(u => !u.isSuspended).length;
  const pendingMod = posts.filter(p => p.status === 'ACTIVE').length;

  const displayedUsers = userFilter
    ? users.filter(u => u.role === userFilter || (userFilter === 'suspended' && u.isSuspended))
    : users;

  const LOG_COLORS: Record<string, string> = {
    USER_LOGIN: 'text-green-400', USER_REGISTERED: 'text-green-400',
    USER_SUSPENDED: 'text-system-red', USER_DELETED: 'text-system-red',
    POST_MODERATED: 'text-system-red',
    MEETING_CONFIRMED: 'text-tech-navy', SLOTS_PROPOSED: 'text-tech-navy',
    NDA_ACCEPTED: 'text-tertiary', ACCOUNT_DELETED: 'text-system-red',
    DATA_EXPORTED: 'text-primary',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-system-red animate-pulse" />
            <p className="text-[10px] text-system-red tracking-[0.2em] uppercase font-bold">SOVEREIGN OVERSIGHT</p>
          </div>
          <h1 className="text-3xl md:text-5xl text-white font-bold">System Administration</h1>
        </div>
        <button onClick={load} className="text-white/40 hover:text-white transition-colors" title="Refresh">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users} count={loading ? '…' : totalUsers} label="Verified .edu Nodes"
          badge="Global Stable" badgeCls="text-green-400 bg-green-400/10"
          borderCls="border-l-4 border-l-system-red"
        />
        <StatCard
          icon={ShieldAlert} count={loading ? '…' : activeNdas} label="Active Users"
          badge="Active NDAs" badgeCls="text-system-red bg-system-red/10"
        />
        <StatCard
          icon={Server} count={loading ? '…' : pendingMod} label="Active Posts"
          badge="Queue Status" badgeCls="text-tertiary bg-tertiary/10"
        />
      </section>

      {/* Moderation + Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Moderation */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Content Moderation Feed</h3>
            <span className="text-[10px] text-white/30">{posts.length} posts</span>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden border-t border-system-red/20">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}
              </div>
            ) : posts.length === 0 ? (
              <p className="p-6 text-white/30 text-sm">No posts to moderate.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {posts.slice(0, 8).map(post => (
                  <div key={post.id} className="p-5 hover:bg-white/5 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${post.status === 'ACTIVE' ? 'bg-clinical-green' : 'bg-white/20'}`} />
                          <h4 className="font-bold text-white text-sm truncate">{post.title}</h4>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[10px] text-white/30 uppercase tracking-widest">
                          <span>{post.status}</span>
                          <span className="font-bold">{post.owner?.name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button className="w-8 h-8 rounded bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all" title="Approve (no action needed)">
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="w-8 h-8 rounded bg-system-red/10 text-system-red flex items-center justify-center hover:bg-system-red hover:text-white transition-all"
                          title="Remove post"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* User Verification / List */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Entity Verification</h3>
            <div className="flex gap-1">
              {['', 'HEALTHCARE', 'ENGINEER', 'ADMIN', 'suspended'].map(f => (
                <button
                  key={f}
                  onClick={() => setUserFilter(f)}
                  className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-bold transition-colors ${userFilter === f ? 'bg-system-red/20 text-system-red border border-system-red/30' : 'text-white/30 hover:text-white border border-white/10'}`}
                >
                  {f || 'ALL'}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden border-t border-system-red/20">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}
              </div>
            ) : displayedUsers.length === 0 ? (
              <p className="p-6 text-white/30 text-sm">No users found.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {displayedUsers.slice(0, 8).map(u => (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded glass-panel flex items-center justify-center shrink-0">
                        <GraduationCap className="text-white/40" size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{u.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] uppercase tracking-widest font-bold ${u.role === 'HEALTHCARE' ? 'text-clinical-green' : u.role === 'ENGINEER' ? 'text-tech-navy' : 'text-system-red'}`}>{u.role}</span>
                          {u.isSuspended && <span className="text-[9px] text-system-red bg-system-red/10 px-1 rounded">SUSPENDED</span>}
                          {!u.isVerified && <span className="text-[9px] text-yellow-400 bg-yellow-400/10 px-1 rounded">UNVERIFIED</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 bg-white/5 text-white/50 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                      >
                        View
                      </button>
                      {!u.isSuspended && u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleSuspendUser(u.id)}
                          className="px-3 py-1.5 bg-system-red/10 text-system-red rounded text-[10px] font-bold uppercase tracking-widest hover:bg-system-red hover:text-white transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Audit Logs */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Sovereign Audit Trail</h3>
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="flex items-center gap-2 text-[10px] bg-white/5 px-3 py-1.5 rounded text-white/60 hover:text-white transition-colors uppercase tracking-widest font-bold border border-white/10 disabled:opacity-50"
          >
            {exportingCsv ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Export CSV
          </button>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t border-system-red/20">
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />)}</div>
          ) : logs.length === 0 ? (
            <p className="text-white/30 text-sm font-mono">No activity logs yet.</p>
          ) : (
            <div className="space-y-3 font-mono text-[11px] text-white/40">
              {logs.map(log => (
                <div key={log.id} className="flex flex-col md:flex-row gap-2 md:gap-6 border-b border-white/5 pb-3 last:border-0 last:pb-0 group">
                  <span className="text-white/20 shrink-0 w-36">{new Date(log.createdAt).toLocaleTimeString()} UTC</span>
                  <span className={`shrink-0 w-36 font-bold ${LOG_COLORS[log.action] ?? 'text-white/40'}`}>[{log.action}]</span>
                  <span className="group-hover:text-white transition-colors">
                    {log.user?.email ?? log.userId ?? 'system'}
                    {log.entity && ` • ${log.entity} ${log.entityId?.slice(0, 8) ?? ''}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative glass-panel p-8 rounded-2xl w-full max-w-md border border-white/20 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-white font-bold text-lg">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            {[
              ['Email', selectedUser.email],
              ['Name', selectedUser.name],
              ['Institution', selectedUser.institution],
              ['Role', selectedUser.role],
              ['Verified', selectedUser.isVerified ? 'Yes' : 'No'],
              ['Suspended', selectedUser.isSuspended ? 'Yes' : 'No'],
              ['Joined', new Date(selectedUser.createdAt).toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">{k}</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
            {!selectedUser.isSuspended && selectedUser.role !== 'ADMIN' && (
              <button
                onClick={() => { handleSuspendUser(selectedUser.id); setSelectedUser(null); }}
                className="w-full py-3 mt-2 bg-system-red/10 text-system-red border border-system-red/20 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-system-red hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <ShieldOff size={14} /> Suspend Account
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
