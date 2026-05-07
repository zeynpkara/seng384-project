import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  X,
  GraduationCap,
  ShieldAlert,
  Server,
  Download,
  Loader2,
  ShieldOff,
  RefreshCw,
} from 'lucide-react';
import { admin as adminApi, downloadFile } from '../api/client';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
  institution: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

interface AdminPost {
  id: string;
  title: string;
  domain: string;
  status: string;
  createdAt: string;
  owner: { id: string; name: string; email: string };
}

interface LogEntry {
  id: string;
  action: string;
  userId: string | null;
  createdAt: string;
  entity: string | null;
  entityId: string | null;
  ipAddress: string | null;
  user: { email: string } | null;
}

function StatCard({ icon: Icon, count, label, badge, badgeCls, borderCls }: {
  icon: React.ElementType;
  count: number | string;
  label: string;
  badge: string;
  badgeCls: string;
  borderCls?: string;
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
  const [flashMessage, setFlashMessage] = useState('');
  const [userActionId, setUserActionId] = useState<string | null>(null);
  const [postActionId, setPostActionId] = useState<string | null>(null);

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
      setUsers([]);
      setPosts([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSuspendUser = async (id: string) => {
    setUserActionId(id);
    try {
      const result = await adminApi.suspendUser(id) as { message?: string; user?: AdminUser };
      setFlashMessage(result.message ?? 'User status updated.');
      if (result.user) {
        setSelectedUser((prev) => prev?.id === id ? result.user! : prev);
      } else {
        setSelectedUser(null);
      }
      await load();
    } catch (err: unknown) {
      setFlashMessage(err instanceof Error ? err.message : 'User update failed');
    } finally {
      setUserActionId(null);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Remove this post from the platform?')) return;
    setPostActionId(id);
    try {
      await adminApi.deletePost(id);
      setFlashMessage('Post removed successfully.');
      await load();
    } catch (err: unknown) {
      setFlashMessage(err instanceof Error ? err.message : 'Post removal failed');
    } finally {
      setPostActionId(null);
    }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      await downloadFile('/api/admin/logs/export', 'health-ai-audit.csv');
    } catch {
      // silent
    } finally {
      setExportingCsv(false);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => !user.isSuspended && user.isVerified).length;
  const activePosts = posts.filter((post) => post.status === 'ACTIVE').length;
  const flaggedUsers = users.filter((user) => user.isSuspended || !user.isVerified).length;

  const displayedUsers = userFilter
    ? users.filter((user) => user.role === userFilter || (userFilter === 'suspended' && user.isSuspended))
    : users;

  const LOG_COLORS: Record<string, string> = {
    USER_LOGIN: 'text-green-400',
    USER_REGISTERED: 'text-green-400',
    USER_SUSPENDED: 'text-system-red',
    USER_DELETED: 'text-system-red',
    POST_MODERATED: 'text-system-red',
    MEETING_CONFIRMED: 'text-tech-navy',
    SLOTS_PROPOSED: 'text-tech-navy',
    NDA_ACCEPTED: 'text-tertiary',
    ACCOUNT_DELETED: 'text-system-red',
    DATA_EXPORTED: 'text-primary',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      <header className="flex justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-system-red animate-pulse" />
            <p className="text-[10px] text-system-red tracking-[0.2em] uppercase font-bold">SOVEREIGN OVERSIGHT</p>
          </div>
          <h1 className="text-3xl md:text-5xl text-white font-bold">System Administration</h1>
        </div>
        <button onClick={() => void load()} className="text-white/40 hover:text-white transition-colors" title="Refresh">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {flashMessage && (
        <div className={`rounded-xl px-5 py-4 text-sm border ${flashMessage.toLowerCase().includes('failed') || flashMessage.toLowerCase().includes('cannot') ? 'bg-red-400/10 border-red-400/20 text-red-400' : 'bg-system-red/10 border-system-red/20 text-white'}`}>
          {flashMessage}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          count={loading ? '...' : totalUsers}
          label="Registered Users"
          badge="Global Stable"
          badgeCls="text-green-400 bg-green-400/10"
          borderCls="border-l-4 border-l-system-red"
        />
        <StatCard
          icon={ShieldAlert}
          count={loading ? '...' : activeUsers}
          label="Active Verified Users"
          badge="Operational"
          badgeCls="text-system-red bg-system-red/10"
        />
        <StatCard
          icon={Server}
          count={loading ? '...' : activePosts}
          label="Active Public Posts"
          badge="Discovery Live"
          badgeCls="text-tertiary bg-tertiary/10"
        />
        <StatCard
          icon={ShieldOff}
          count={loading ? '...' : flaggedUsers}
          label="Suspended / Unverified"
          badge="Needs Review"
          badgeCls="text-yellow-400 bg-yellow-400/10"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-6 lg:col-span-2">
          <p className="text-[10px] text-system-red tracking-[0.2em] uppercase font-bold mb-3">ADMIN MISSION</p>
          <h2 className="text-2xl text-white font-semibold">Protect discovery, not manage delivery</h2>
          <p className="text-white/55 mt-3 leading-relaxed">
            The admin role is here to verify academic trust, moderate public content, and preserve a permanent audit trail.
            This is an oversight console, not a collaboration workspace.
          </p>
        </div>
        <div className="glass-panel rounded-xl p-6">
          <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-bold mb-4">QUICK LINKS</p>
          <div className="space-y-3 text-sm">
            <a href="#users" className="block rounded-lg bg-white/5 px-4 py-3 text-white/65 hover:bg-white/10 hover:text-white transition-colors">Review users</a>
            <a href="#posts" className="block rounded-lg bg-white/5 px-4 py-3 text-white/65 hover:bg-white/10 hover:text-white transition-colors">Moderate posts</a>
            <a href="#logs" className="block rounded-lg bg-white/5 px-4 py-3 text-white/65 hover:bg-white/10 hover:text-white transition-colors">Export logs</a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section id="posts">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Content Moderation Feed</h3>
            <span className="text-[10px] text-white/30">{posts.length} posts</span>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden border-t border-system-red/20">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}
              </div>
            ) : posts.length === 0 ? (
              <p className="p-6 text-white/30 text-sm">No posts to moderate.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {posts.map((post) => (
                  <div key={post.id} className="p-5 hover:bg-white/5 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${post.status === 'ACTIVE' ? 'bg-clinical-green' : 'bg-white/20'}`} />
                          <h4 className="font-bold text-white text-sm truncate">{post.title}</h4>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[10px] text-white/30 uppercase tracking-widest">
                          <span>{post.status}</span>
                          <span>{post.domain}</span>
                          <span className="font-bold">{post.owner?.name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => void handleDeletePost(post.id)}
                          disabled={postActionId === post.id}
                          className="px-3 h-8 rounded bg-system-red/10 text-system-red flex items-center justify-center gap-1.5 hover:bg-system-red hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
                          title="Remove post"
                        >
                          {postActionId === post.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="users">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Entity Verification</h3>
            <div className="flex gap-1">
              {['', 'HEALTHCARE', 'ENGINEER', 'ADMIN', 'suspended'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setUserFilter(filter)}
                  className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-bold transition-colors ${userFilter === filter ? 'bg-system-red/20 text-system-red border border-system-red/30' : 'text-white/30 hover:text-white border border-white/10'}`}
                >
                  {filter || 'ALL'}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden border-t border-system-red/20">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}
              </div>
            ) : displayedUsers.length === 0 ? (
              <p className="p-6 text-white/30 text-sm">No users found.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {displayedUsers.map((adminUser) => (
                  <div key={adminUser.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded glass-panel flex items-center justify-center shrink-0">
                        <GraduationCap className="text-white/40" size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{adminUser.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] uppercase tracking-widest font-bold ${adminUser.role === 'HEALTHCARE' ? 'text-clinical-green' : adminUser.role === 'ENGINEER' ? 'text-tech-navy' : 'text-system-red'}`}>{adminUser.role}</span>
                          {adminUser.isSuspended && <span className="text-[9px] text-system-red bg-system-red/10 px-1 rounded">SUSPENDED</span>}
                          {!adminUser.isVerified && <span className="text-[9px] text-yellow-400 bg-yellow-400/10 px-1 rounded">UNVERIFIED</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedUser(adminUser)}
                        className="px-3 py-1.5 bg-white/5 text-white/50 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                      >
                        View
                      </button>
                      {!adminUser.isSuspended && adminUser.role !== 'ADMIN' && (
                        <button
                          onClick={() => void handleSuspendUser(adminUser.id)}
                          disabled={userActionId === adminUser.id}
                          className="px-3 py-1.5 bg-system-red/10 text-system-red rounded text-[10px] font-bold uppercase tracking-widest hover:bg-system-red hover:text-white transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {adminUser.isSuspended && adminUser.role !== 'ADMIN' && (
                        <button
                          onClick={() => void handleSuspendUser(adminUser.id)}
                          disabled={userActionId === adminUser.id}
                          className="px-3 py-1.5 bg-clinical-green/10 text-clinical-green rounded text-[10px] font-bold uppercase tracking-widest hover:bg-clinical-green hover:text-white transition-colors"
                        >
                          Reactivate
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

      <section id="logs">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Sovereign Audit Trail</h3>
          <button
            onClick={() => void handleExportCsv()}
            disabled={exportingCsv}
            className="flex items-center gap-2 text-[10px] bg-white/5 px-3 py-1.5 rounded text-white/60 hover:text-white transition-colors uppercase tracking-widest font-bold border border-white/10 disabled:opacity-50"
          >
            {exportingCsv ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Export CSV
          </button>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t border-system-red/20">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />)}</div>
          ) : logs.length === 0 ? (
            <p className="text-white/30 text-sm font-mono">No activity logs yet.</p>
          ) : (
            <div className="space-y-3 font-mono text-[11px] text-white/40">
              {logs.map((log) => (
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
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">{label}</span>
                <span className="text-white">{value}</span>
              </div>
            ))}
            {selectedUser.role !== 'ADMIN' && (
              <button
                onClick={() => void handleSuspendUser(selectedUser.id)}
                disabled={userActionId === selectedUser.id}
                className={`w-full py-3 mt-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectedUser.isSuspended ? 'bg-clinical-green/10 text-clinical-green border border-clinical-green/20 hover:bg-clinical-green hover:text-white' : 'bg-system-red/10 text-system-red border border-system-red/20 hover:bg-system-red hover:text-white'}`}
              >
                {userActionId === selectedUser.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
                {selectedUser.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
