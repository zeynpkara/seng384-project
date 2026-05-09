import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Rocket,
  Activity,
  Database,
  Stethoscope,
  CheckCircle2,
  Loader2,
  Video,
} from 'lucide-react';

const PLATFORM_BADGE: Record<string, { label: string; cls: string }> = {
  ZOOM: { label: 'Zoom', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  GOOGLE_MEET: { label: 'Meet', cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  TEAMS: { label: 'Teams', cls: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
};
import { posts as postsApi, meetings as meetingsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCreateModal from '../components/PostCreateModal';
import FilterBar from '../components/FilterBar';
import NdaModal from '../components/NdaModal';
import MeetingsDashboard from '../components/MeetingsDashboard';

interface Post {
  id: string;
  ownerId: string;
  title: string;
  domain: string;
  description: string;
  requiredExpertise: string;
  preferredPlatform?: string;
  status: string;
  city: string;
  createdAt: string;
  owner: { name: string; institution: string; role?: string };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: 'Active', cls: 'text-tech-navy bg-tech-navy/10 border-tech-navy/20' },
    MEETING_SCHEDULED: { label: 'Urgent Match', cls: 'text-clinical-green bg-clinical-green/10 border-clinical-green/20' },
  };
  const s = map[status] ?? { label: status, cls: 'text-white/40 bg-white/5 border-white/10' };
  return <span className={`text-[10px] px-3 py-1 border rounded-full font-bold tracking-widest ${s.cls}`}>{s.label}</span>;
}

function FeedSkeleton() {
  return (
    <div className="glass-panel p-8 rounded-lg animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-10 h-10 bg-white/5 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded w-1/2" />
          <div className="h-3 bg-white/5 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded" />
        <div className="h-3 bg-white/5 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function TechnicalDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [feed, setFeed] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [myPostsLoading, setMyPostsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const isFirstMount = useRef(true);
  const [meetingsRefresh, setMeetingsRefresh] = useState(0);

  // Express Interest state
  const [interestLoading, setInterestLoading] = useState<string | null>(null);
  const [interestDone, setInterestDone] = useState<Set<string>>(new Set());
  const [ndaModal, setNdaModal] = useState<{ open: boolean; meetingId: string }>({ open: false, meetingId: '' });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const loadFeed = useCallback(async (filters: Record<string, string> = {}) => {
    setFeedLoading(true);
    try {
      const data = await postsApi.getPosts({ limit: '12', ownerRole: 'HEALTHCARE', ...filters }) as Post[];
      setFeed(data);
    } catch {
      setFeed([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const loadMyPosts = useCallback(async () => {
    setMyPostsLoading(true);
    try {
      const data = await postsApi.getMyPosts() as Post[];
      setMyPosts(data);
    } catch {
      setMyPosts([]);
    } finally {
      setMyPostsLoading(false);
    }
  }, []);

  useEffect(() => { loadFeed(); loadMyPosts(); }, [loadFeed, loadMyPosts]);

  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    loadFeed(activeFilters);
  }, [activeFilters, loadFeed]);

  const handleExpressInterest = async (postId: string) => {
    setInterestLoading(postId);
    setSuccessMsg('');
    try {
      const check = await meetingsApi.checkInterest(postId);
      if (check.hasInterest) {
        setInterestDone(prev => new Set(prev).add(postId));
        setSuccessMsg('You have already expressed interest in this post.');
        return;
      }

      const res = await meetingsApi.expressInterest(postId, {});
      if (res.requiresNDA) {
        setNdaModal({ open: true, meetingId: res.meetingId });
      } else {
        setInterestDone(prev => new Set(prev).add(postId));
        setSuccessMsg('Your interest has been submitted. The post owner will propose meeting times.');
        setMeetingsRefresh(k => k + 1);
      }
    } catch (err: unknown) {
      setSuccessMsg(err instanceof Error ? err.message : 'Failed to express interest');
    } finally {
      setInterestLoading(null);
    }
  };

  const handleNdaAccepted = () => {
    setNdaModal({ open: false, meetingId: '' });
    setSuccessMsg('Your interest has been submitted. The post owner will propose meeting times.');
    setMeetingsRefresh(k => k + 1);
    loadFeed(activeFilters);
  };

  const handleCreated = () => { loadFeed(activeFilters); loadMyPosts(); };

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-tech-navy animate-pulse" />
            <p className="text-[10px] text-tech-navy tracking-widest font-bold uppercase">ENGINEERING HUB</p>
          </div>
          <h1 className="text-3xl md:text-5xl text-white font-bold">Project Console</h1>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="glass-panel-elevated bg-tech-navy/10 border-tech-navy/30 hover:bg-tech-navy/20 text-tech-navy px-8 py-4 rounded flex items-center gap-3 transition-all duration-300 font-bold text-sm tracking-widest uppercase"
        >
          <Rocket size={18} fill="currentColor" />
          <span>POST NEW PROJECT</span>
        </button>
      </motion.div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 bg-tech-navy/10 border border-tech-navy/20 text-tech-navy rounded-xl px-5 py-4 text-sm">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl text-white font-semibold flex items-center gap-2">
              <Stethoscope className="text-clinical-green" />
              <span>Available Clinical Challenges</span>
            </h2>
          </div>

          <FilterBar onChange={setActiveFilters} accentColor="tech-navy" />

          {feedLoading ? (
            <div className="space-y-6">{[1,2,3].map(i => <FeedSkeleton key={i} />)}</div>
          ) : feed.length === 0 ? (
            <div className="glass-panel p-12 rounded-xl text-center space-y-3">
              <p className="text-white/50 text-base font-medium">No posts match your criteria</p>
              <p className="text-white/25 text-sm">Try adjusting the filters or clear them to see all posts.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feed.map(post => {
                const done = interestDone.has(post.id);
                const isLoading = interestLoading === post.id;
                const isOwn = user?.id === post.ownerId;
                return (
                  <div key={post.id} className="glass-panel p-8 rounded-lg relative overflow-hidden group hover:border-white/20 transition-colors duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-tech-navy" />
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center border border-white/10">
                          <Activity className="text-tech-navy" size={20} />
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-base">{post.title}</h3>
                          <p className="text-white/50 text-sm">{post.owner.name}, {post.owner.institution} • {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StatusBadge status={post.status} />
                    </div>
                    <p className="text-white/70 mb-6 leading-relaxed text-sm line-clamp-3">{post.description}</p>
                    <div className="flex flex-wrap items-center gap-6 border-t border-white/5 pt-4">
                      <span className="flex items-center text-white/40 text-[10px] uppercase font-bold tracking-widest gap-2">
                        <Database size={14} />
                        <span className="truncate max-w-[160px]">{post.requiredExpertise}</span>
                      </span>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest flex items-center gap-2 flex-wrap">
                        <span>{post.domain} • {post.city}</span>
                        {post.preferredPlatform && PLATFORM_BADGE[post.preferredPlatform] && (
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border font-bold normal-case tracking-normal text-[9px] ${PLATFORM_BADGE[post.preferredPlatform].cls}`}>
                            <Video size={9} />{PLATFORM_BADGE[post.preferredPlatform].label}
                          </span>
                        )}
                      </span>
                      {!isOwn && post.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleExpressInterest(post.id)}
                          disabled={isLoading || done}
                          className="ml-auto flex items-center gap-1.5 text-tech-navy hover:text-white transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                          {isLoading && <Loader2 size={12} className="animate-spin" />}
                          {done ? <><CheckCircle2 size={12} /> Interest Sent</> : 'Express Interest'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* My Projects */}
          <div className="glass-panel p-8 rounded-lg border-l-4 border-tech-navy/30">
            <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-6">MY ACTIVE PROJECTS</h3>
            {myPostsLoading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}</div>
            ) : myPosts.length === 0 ? (
              <p className="text-white/30 text-sm">No projects yet. Post your first above.</p>
            ) : (
              <div className="space-y-3">
                {myPosts.map(post => (
                  <div key={post.id} className="glass-panel-elevated p-4 rounded flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${post.status === 'ACTIVE' ? 'bg-tech-navy' : post.status === 'DRAFT' ? 'bg-white/20' : 'bg-clinical-green'}`} />
                      <span className="text-white font-medium text-sm">{post.title}</span>
                    </div>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{post.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 space-y-8">
          {/* Meetings */}
          <div className="glass-panel p-6 rounded-lg">
            <h3 className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">MY MEETINGS</h3>
            {user ? (
              <MeetingsDashboard userId={user.id} refreshKey={meetingsRefresh} />
            ) : (
              <p className="text-white/30 text-xs">Log in to see meetings.</p>
            )}
          </div>

          {/* Guidelines */}
          <div className="glass-panel p-6 rounded-lg bg-tech-navy/5 border-tech-navy/20">
            <h3 className="text-tech-navy font-bold text-sm uppercase tracking-widest mb-4">Engineering Guidelines</h3>
            <ul className="space-y-3 text-[11px] text-white/60 leading-tight">
              <li className="flex gap-2"><span className="text-tech-navy font-bold">•</span><span>No Technical Document Uploads Allowed.</span></li>
              <li className="flex gap-2"><span className="text-tech-navy font-bold">•</span><span>NDA execution is mandatory before data access.</span></li>
              <li className="flex gap-2"><span className="text-tech-navy font-bold">•</span><span>Clinical validation must occur via external meetings.</span></li>
            </ul>
          </div>
        </div>
      </div>

      <PostCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={handleCreated} />
      <NdaModal
        isOpen={ndaModal.open}
        meetingId={ndaModal.meetingId}
        onAccepted={handleNdaAccepted}
        onCancel={() => setNdaModal({ open: false, meetingId: '' })}
      />
    </div>
  );
}
