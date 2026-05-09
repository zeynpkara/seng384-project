import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, X, GraduationCap, ShieldAlert, Server, Download,
  Loader2, ShieldOff, RefreshCw, BarChart2, FileText, ScrollText,
  Activity, TrendingUp, Stethoscope, Cpu,
} from 'lucide-react';
import { admin as adminApi, downloadFile } from '../api/client';

type Tab = 'overview' | 'users' | 'posts' | 'logs';

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

// ─── CSS Bar Chart helpers ───────────────────────────────────────────────────

function HBar({ label, value, max, color, sublabel }: {
  label: string; value: number; max: number; color: string; sublabel?: string
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-white/70 font-medium">{label}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {sublabel && <p className="text-[10px] text-white/25">{sublabel}</p>}
    </div>
  );
}

function VBars({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] text-white/40">{d.value > 0 ? d.value : ''}</span>
          <div className="w-full bg-white/5 rounded-t overflow-hidden flex flex-col justify-end" style={{ height: '60px' }}>
            <div
              className={`w-full rounded-t transition-all duration-700 ${color}`}
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 8 : 0)}%` }}
            />
          </div>
          <span className="text-[9px] text-white/30 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ slices }: { slices: { label: string; value: number; color: string; textColor: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div className="h-24 flex items-center justify-center text-white/20 text-xs">No data</div>;

  let offset = 0;
  const r = 40;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
          {slices.map((s, i) => {
            const frac = s.value / total;
            const dashLen = frac * circ;
            const el = (
              <circle
                key={i}
                cx="50" cy="50" r={r}
                fill="none"
                strokeWidth="14"
                stroke={s.color}
                strokeDasharray={`${dashLen} ${circ - dashLen}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dashLen;
            return el;
          })}
          <circle cx="50" cy="50" r="28" fill="#0E0E0E" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white/70">{total}</span>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {slices.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-white/60 flex-1">{s.label}</span>
            <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[10px] text-white/25">{total > 0 ? Math.round(s.value / total * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const LOG_COLORS: Record<string, string> = {
  USER_LOGIN: 'text-green-400',
  USER_REGISTERED: 'text-green-400',
  EMAIL_VERIFIED: 'text-green-400',
  USER_SUSPENDED: 'text-system-red',
  USER_DELETED: 'text-system-red',
  POST_MODERATED: 'text-system-red',
  MEETING_CONFIRMED: 'text-tech-navy',
  SLOTS_PROPOSED: 'text-tech-navy',
  MEETING_REJECTED: 'text-white/40',
  NDA_ACCEPTED: 'text-primary',
  INTEREST_EXPRESSED: 'text-primary',
  POST_CREATED: 'text-yellow-400',
  POST_PUBLISHED: 'text-yellow-400',
  POST_CLOSED: 'text-white/40',
  ACCOUNT_DELETED: 'text-system-red',
  DATA_EXPORTED: 'text-primary',
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SystemAdmin() {
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [userFilter, setUserFilter] = useState('');
  const [logFilter, setLogFilter] = useState('');
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
        adminApi.getLogs({ limit: '20' }) as Promise<{ logs: LogEntry[] }>,
      ]);
      setUsers(u);
      setPosts(p);
      setLogs(l.logs ?? []);
    } catch {
      setUsers([]); setPosts([]); setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllLogs = useCallback(async () => {
    if (allLogs.length > 0) return;
    setLogsLoading(true);
    try {
      const l = await adminApi.getLogs({ limit: '200' }) as { logs: LogEntry[] };
      setAllLogs(l.logs ?? []);
    } catch {
      setAllLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [allLogs.length]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (tab === 'logs') void loadAllLogs(); }, [tab, loadAllLogs]);

  const handleSuspendUser = async (id: string) => {
    setUserActionId(id);
    try {
      const result = await adminApi.suspendUser(id) as { message?: string; user?: AdminUser };
      setFlashMessage(result.message ?? 'User status updated.');
      if (result.user) setSelectedUser(prev => prev?.id === id ? result.user! : prev);
      else setSelectedUser(null);
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
    try { await downloadFile('/api/admin/logs/export', 'health-ai-audit.csv'); }
    catch { /* silent */ }
    finally { setExportingCsv(false); }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.isVerified && !u.isSuspended).length;
  const suspendedUsers = users.filter(u => u.isSuspended).length;
  const unverifiedUsers = users.filter(u => !u.isVerified && !u.isSuspended).length;
  const healthcareCount = users.filter(u => u.role === 'HEALTHCARE').length;
  const engineerCount = users.filter(u => u.role === 'ENGINEER').length;

  const postsByStatus = {
    ACTIVE: posts.filter(p => p.status === 'ACTIVE').length,
    DRAFT: posts.filter(p => p.status === 'DRAFT').length,
    MEETING_SCHEDULED: posts.filter(p => p.status === 'MEETING_SCHEDULED').length,
    CLOSED: posts.filter(p => p.status === 'CLOSED').length,
    EXPIRED: posts.filter(p => p.status === 'EXPIRED').length,
  };

  // Last 7 days activity from recent logs
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), date: d.toDateString(), value: 0 };
  });
  logs.forEach(log => {
    const d = new Date(log.createdAt).toDateString();
    const slot = last7.find(s => s.date === d);
    if (slot) slot.value++;
  });

  // Top action types
  const actionCounts: Record<string, number> = {};
  logs.forEach(l => { actionCounts[l.action] = (actionCounts[l.action] ?? 0) + 1; });
  const topActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const displayedUsers = userFilter
    ? users.filter(u => u.role === userFilter || (userFilter === 'suspended' && u.isSuspended))
    : users;

  const displayedLogs = logFilter
    ? (allLogs.length > 0 ? allLogs : logs).filter(l => l.action.includes(logFilter.toUpperCase()))
    : (allLogs.length > 0 ? allLogs : logs);

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: `Users (${totalUsers})`, icon: Users },
    { id: 'posts', label: `Posts (${posts.length})`, icon: FileText },
    { id: 'logs', label: 'Audit Logs', icon: ScrollText },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
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
          <button className="ml-3 text-white/40 hover:text-white" onClick={() => setFlashMessage('')}>✕</button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
              tab === t.id
                ? 'bg-system-red/20 text-system-red border border-system-red/30'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-8">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, count: loading ? '…' : totalUsers, label: 'Total Users', badge: 'Registered', badgeCls: 'text-white/50 bg-white/5' },
              { icon: ShieldAlert, count: loading ? '…' : verifiedUsers, label: 'Active Verified', badge: 'Operational', badgeCls: 'text-green-400 bg-green-400/10' },
              { icon: Server, count: loading ? '…' : postsByStatus.ACTIVE, label: 'Active Posts', badge: 'Live', badgeCls: 'text-primary bg-primary/10' },
              { icon: ShieldOff, count: loading ? '…' : suspendedUsers + unverifiedUsers, label: 'Needs Review', badge: 'Action Req.', badgeCls: 'text-yellow-400 bg-yellow-400/10' },
            ].map(({ icon: Icon, count, label, badge, badgeCls }) => (
              <div key={label} className="glass-panel p-5 rounded-xl border-l-4 border-l-system-red/40">
                <div className="flex justify-between items-start mb-3">
                  <Icon className="text-white/30" size={20} />
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${badgeCls}`}>{badge}</span>
                </div>
                <p className="text-3xl font-bold text-white leading-none">{count}</p>
                <p className="text-[10px] text-white/40 mt-1.5 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User composition donut */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Users size={14} className="text-white/40" />
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">User Composition</p>
              </div>
              {loading ? <div className="h-24 bg-white/5 rounded animate-pulse" /> : (
                <DonutChart slices={[
                  { label: 'Healthcare', value: healthcareCount, color: '#10B981', textColor: '#10B981' },
                  { label: 'Engineer', value: engineerCount, color: '#2563EB', textColor: '#60a5fa' },
                  { label: 'Admin', value: users.filter(u => u.role === 'ADMIN').length, color: '#DC2626', textColor: '#DC2626' },
                ]} />
              )}
            </div>

            {/* Post status breakdown */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={14} className="text-white/40" />
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Post Status</p>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />)}</div>
              ) : (
                <div className="space-y-4">
                  <HBar label="Active" value={postsByStatus.ACTIVE} max={posts.length} color="bg-clinical-green" />
                  <HBar label="Scheduled" value={postsByStatus.MEETING_SCHEDULED} max={posts.length} color="bg-primary" />
                  <HBar label="Draft" value={postsByStatus.DRAFT} max={posts.length} color="bg-white/20" />
                  <HBar label="Closed" value={postsByStatus.CLOSED} max={posts.length} color="bg-tech-navy" />
                </div>
              )}
            </div>

            {/* 7-day activity */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity size={14} className="text-white/40" />
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">7-Day Activity</p>
              </div>
              {loading ? <div className="h-24 bg-white/5 rounded animate-pulse" /> : (
                <VBars data={last7} color="bg-system-red/60" />
              )}
            </div>
          </div>

          {/* Second charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User verification state */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap size={14} className="text-white/40" />
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">User Health</p>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />)}</div>
              ) : (
                <div className="space-y-4">
                  <HBar label="Verified & Active" value={verifiedUsers} max={totalUsers} color="bg-clinical-green" sublabel={`${totalUsers > 0 ? Math.round(verifiedUsers/totalUsers*100) : 0}% of total`} />
                  <HBar label="Pending Verification" value={unverifiedUsers} max={totalUsers} color="bg-yellow-400" />
                  <HBar label="Suspended" value={suspendedUsers} max={totalUsers} color="bg-system-red" />
                </div>
              )}
            </div>

            {/* Top actions */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <ScrollText size={14} className="text-white/40" />
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Top Actions (Recent)</p>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />)}</div>
              ) : topActions.length === 0 ? (
                <p className="text-white/25 text-xs">No log data yet.</p>
              ) : (
                <div className="space-y-3">
                  {topActions.map(([action, count]) => (
                    <div key={action}>
                      <HBar
                        label={action.replace(/_/g, ' ')}
                        value={count}
                        max={topActions[0][1]}
                        color={`${LOG_COLORS[action]?.replace('text-', 'bg-') ?? 'bg-white/20'} opacity-70`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role distribution breakdown */}
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 size={14} className="text-white/40" />
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Platform Distribution</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Stethoscope size={16} className="text-clinical-green" />
                  <span className="text-sm text-white font-bold">Healthcare</span>
                </div>
                <p className="text-4xl font-bold text-clinical-green">{loading ? '…' : healthcareCount}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Clinical professionals</p>
                <div className="h-1.5 bg-white/5 rounded-full mt-1">
                  <div className="h-full bg-clinical-green rounded-full transition-all duration-700" style={{ width: `${totalUsers > 0 ? healthcareCount/totalUsers*100 : 0}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-tech-navy" />
                  <span className="text-sm text-white font-bold">Engineer</span>
                </div>
                <p className="text-4xl font-bold text-[#60a5fa]">{loading ? '…' : engineerCount}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Technical professionals</p>
                <div className="h-1.5 bg-white/5 rounded-full mt-1">
                  <div className="h-full bg-tech-navy rounded-full transition-all duration-700" style={{ width: `${totalUsers > 0 ? engineerCount/totalUsers*100 : 0}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-white/50" />
                  <span className="text-sm text-white font-bold">Total Posts</span>
                </div>
                <p className="text-4xl font-bold text-white">{loading ? '…' : posts.length}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">{postsByStatus.ACTIVE} active · {postsByStatus.DRAFT} draft</p>
                <div className="h-1.5 bg-white/5 rounded-full mt-1">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: posts.length > 0 ? `${postsByStatus.ACTIVE/posts.length*100}%` : '0%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <section>
          <div className="flex justify-between items-center mb-5">
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
              <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}</div>
            ) : displayedUsers.length === 0 ? (
              <p className="p-6 text-white/30 text-sm">No users found.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {displayedUsers.map((adminUser) => (
                  <div key={adminUser.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded glass-panel flex items-center justify-center shrink-0">
                        <GraduationCap className="text-white/40" size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{adminUser.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] uppercase tracking-widest font-bold ${adminUser.role === 'HEALTHCARE' ? 'text-clinical-green' : adminUser.role === 'ENGINEER' ? 'text-[#60a5fa]' : 'text-system-red'}`}>{adminUser.role}</span>
                          <span className="text-[9px] text-white/30">{adminUser.institution}</span>
                          {adminUser.isSuspended && <span className="text-[9px] text-system-red bg-system-red/10 px-1 rounded">SUSPENDED</span>}
                          {!adminUser.isVerified && <span className="text-[9px] text-yellow-400 bg-yellow-400/10 px-1 rounded">UNVERIFIED</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setSelectedUser(adminUser)} className="px-3 py-1.5 bg-white/5 text-white/50 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                        View
                      </button>
                      {!adminUser.isSuspended && adminUser.role !== 'ADMIN' && (
                        <button onClick={() => void handleSuspendUser(adminUser.id)} disabled={userActionId === adminUser.id} className="px-3 py-1.5 bg-system-red/10 text-system-red rounded text-[10px] font-bold uppercase tracking-widest hover:bg-system-red hover:text-white transition-colors disabled:opacity-50">
                          {userActionId === adminUser.id ? <Loader2 size={12} className="animate-spin" /> : 'Suspend'}
                        </button>
                      )}
                      {adminUser.isSuspended && adminUser.role !== 'ADMIN' && (
                        <button onClick={() => void handleSuspendUser(adminUser.id)} disabled={userActionId === adminUser.id} className="px-3 py-1.5 bg-clinical-green/10 text-clinical-green rounded text-[10px] font-bold uppercase tracking-widest hover:bg-clinical-green hover:text-white transition-colors disabled:opacity-50">
                          {userActionId === adminUser.id ? <Loader2 size={12} className="animate-spin" /> : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── POSTS TAB ── */}
      {tab === 'posts' && (
        <section>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Content Moderation Feed</h3>
            <span className="text-[10px] text-white/30">{posts.length} total</span>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden border-t border-system-red/20">
            {loading ? (
              <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}</div>
            ) : posts.length === 0 ? (
              <p className="p-6 text-white/30 text-sm">No posts to moderate.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {posts.map((post) => (
                  <div key={post.id} className="p-5 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${post.status === 'ACTIVE' ? 'bg-clinical-green' : post.status === 'MEETING_SCHEDULED' ? 'bg-primary' : 'bg-white/20'}`} />
                          <h4 className="font-bold text-white text-sm truncate">{post.title}</h4>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[10px] text-white/30 uppercase tracking-widest">
                          <span className={post.status === 'ACTIVE' ? 'text-clinical-green' : 'text-white/30'}>{post.status}</span>
                          <span>{post.domain}</span>
                          <span className="font-bold text-white/50">{post.owner?.name}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => void handleDeletePost(post.id)}
                        disabled={postActionId === post.id}
                        className="px-3 h-8 rounded bg-system-red/10 text-system-red flex items-center justify-center gap-1.5 hover:bg-system-red hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold disabled:opacity-50 shrink-0"
                      >
                        {postActionId === post.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── LOGS TAB ── */}
      {tab === 'logs' && (
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <h3 className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Sovereign Audit Trail</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={logFilter}
                onChange={e => setLogFilter(e.target.value)}
                placeholder="Filter by action..."
                className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40 w-48"
              />
              <button
                onClick={() => void handleExportCsv()}
                disabled={exportingCsv}
                className="flex items-center gap-2 text-[10px] bg-white/5 px-3 py-1.5 rounded text-white/60 hover:text-white transition-colors uppercase tracking-widest font-bold border border-white/10 disabled:opacity-50 shrink-0"
              >
                {exportingCsv ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                Export CSV
              </button>
            </div>
          </div>
          <div className="glass-panel rounded-xl border-t border-system-red/20 overflow-hidden">
            {loading || logsLoading ? (
              <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />)}</div>
            ) : displayedLogs.length === 0 ? (
              <p className="p-6 text-white/30 text-sm font-mono">No matching logs.</p>
            ) : (
              <div className="divide-y divide-white/5 max-h-[calc(100vh-280px)] overflow-y-auto">
                {displayedLogs.map((log) => (
                  <div key={log.id} className="px-5 py-3 flex flex-col sm:flex-row gap-1.5 sm:gap-5 hover:bg-white/3 transition-colors font-mono text-[11px]">
                    <span className="text-white/20 shrink-0 sm:w-44">
                      {new Date(log.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      {' '}
                      {new Date(log.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`shrink-0 sm:w-48 font-bold truncate ${LOG_COLORS[log.action] ?? 'text-white/40'}`}>
                      {log.action}
                    </span>
                    <span className="text-white/50 truncate">
                      {log.user?.email ?? log.userId ?? 'system'}
                      {log.entity && <span className="text-white/25"> · {log.entity} {log.entityId?.slice(0, 8)}</span>}
                      {log.ipAddress && <span className="text-white/20"> · {log.ipAddress}</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative glass-panel p-8 rounded-2xl w-full max-w-md border border-white/20 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-white font-bold text-lg">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            {([
              ['Email', selectedUser.email],
              ['Name', selectedUser.name],
              ['Institution', selectedUser.institution],
              ['Role', selectedUser.role],
              ['Verified', selectedUser.isVerified ? 'Yes' : 'No'],
              ['Suspended', selectedUser.isSuspended ? 'Yes' : 'No'],
              ['Joined', new Date(selectedUser.createdAt).toLocaleDateString()],
            ] as [string, string][]).map(([label, value]) => (
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
