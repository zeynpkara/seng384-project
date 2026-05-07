import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FileText,
  ArrowRight,
  PlusSquare,
  Users,
  Compass,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
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
  status: string;
  city: string;
  createdAt: string;
  owner: { name: string; institution: string; role?: string };
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'MEETING_SCHEDULED') {
    return <span className="text-[10px] bg-clinical-green/10 px-2 py-1 rounded text-clinical-green uppercase tracking-widest font-bold">Partner Found Soon</span>;
  }
  return <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/40 uppercase tracking-widest font-bold">Active</span>;
}

function PostCardSkeleton() {
  return (
    <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border-t-2 border-t-white/5 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded bg-white/5" />
        <div className="w-20 h-5 rounded bg-white/5" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
      <div className="h-8 bg-white/5 rounded" />
    </div>
  );
}

export default function Dashboard() {
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
      const data = await postsApi.getPosts({ limit: '12', ownerRole: 'ENGINEER', ...filters }) as Post[];
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
      // Check if already expressed
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
    setInterestDone(prev => new Set(prev).add('*'));
    setSuccessMsg('Your interest has been submitted. The post owner will propose meeting times.');
    setMeetingsRefresh(k => k + 1);
    loadFeed(activeFilters);
  };

  const handleCreated = () => { loadFeed(activeFilters); loadMyPosts(); };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-clinical-green animate-pulse" />
            <p className="text-clinical-green tracking-widest text-[10px] uppercase font-bold">CLINICAL AUTHORITY CONSOLE</p>
          </div>
          <h1 className="text-3xl md:text-5xl text-white font-bold">Clinical Dashboard</h1>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="glass-panel-elevated bg-clinical-green/10 hover:bg-clinical-green/20 text-clinical-green border-clinical-green/30 px-8 py-4 rounded-lg text-sm tracking-widest transition-all duration-300 flex items-center gap-3 font-bold uppercase"
        >
          <PlusSquare size={18} />
          <span>CREATE CLINICAL NEED</span>
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 bg-clinical-green/10 border border-clinical-green/20 text-clinical-green rounded-xl px-5 py-4 text-sm">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl text-white font-semibold flex items-center gap-2">
              <Compass className="text-clinical-green" />
              <span>Discover Engineering Partners</span>
            </h2>
          </div>

          <FilterBar onChange={setActiveFilters} />

          {feedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => <PostCardSkeleton key={i} />)}
            </div>
          ) : feed.length === 0 ? (
            <div className="glass-panel p-12 rounded-xl text-center space-y-3">
              <p className="text-white/50 text-base font-medium">No posts match your criteria</p>
              <p className="text-white/25 text-sm">Try adjusting the filters or clear them to see all posts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feed.map(post => {
                const done = interestDone.has(post.id) || interestDone.has('*');
                const loading = interestLoading === post.id;
                const isOwn = user?.id === post.ownerId;
                return (
                  <motion.div key={post.id} whileHover={{ y: -5 }} className="glass-panel p-6 rounded-xl flex flex-col gap-4 border-t-2 border-t-tech-navy/50">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded bg-tech-navy/10 flex items-center justify-center">
                        <Users className="text-tech-navy" />
                      </div>
                      <StatusBadge status={post.status} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">{post.title}</h3>
                      <p className="text-white/50 text-xs mt-1">{post.owner.name} • {post.owner.institution}</p>
                    </div>
                    <p className="text-sm text-white/60 line-clamp-2">{post.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-white/30 uppercase tracking-widest">{post.domain} • {post.city}</span>
                      {!isOwn && post.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleExpressInterest(post.id)}
                          disabled={loading || done}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 text-tech-navy hover:text-white"
                        >
                          {loading && <Loader2 size={11} className="animate-spin" />}
                          {done ? <><CheckCircle2 size={11} /> Sent</> : 'Express Interest'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* My Posts */}
          <div className="glass-panel rounded-xl p-8 border-l-4 border-l-clinical-green">
            <h2 className="text-xl text-white font-semibold mb-6">My Active Clinical Needs</h2>
            {myPostsLoading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}</div>
            ) : myPosts.filter(p => ['ACTIVE','MEETING_SCHEDULED','DRAFT'].includes(p.status)).length === 0 ? (
              <p className="text-white/30 text-sm">No posts yet. Create your first clinical need above.</p>
            ) : (
              <div className="space-y-3">
                {myPosts.filter(p => ['ACTIVE','MEETING_SCHEDULED','DRAFT'].includes(p.status)).map(post => (
                  <div key={post.id} className="glass-panel-elevated p-5 rounded-lg flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-colors">
                    <div>
                      <h4 className="text-white font-medium text-sm">{post.title}</h4>
                      <p className="text-white/40 text-[10px] mt-1 uppercase tracking-widest">{post.status} • {post.domain}</p>
                    </div>
                    <ArrowRight className="text-white/20 group-hover:text-clinical-green transition-colors" size={16} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <section className="col-span-12 lg:col-span-4 space-y-8">
          {/* Meetings panel */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-6 border-b border-white/5 pb-2">MEETING REQUESTS</h2>
            {user ? (
              <MeetingsDashboard userId={user.id} refreshKey={meetingsRefresh} />
            ) : (
              <p className="text-white/30 text-sm">Log in to see meeting requests.</p>
            )}
          </div>

          {/* Compliance */}
          <div className="glass-panel rounded-xl p-6 border-t-2 border-t-system-red/30">
            <h2 className="text-[10px] text-system-red font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-2">CRITICAL RESTRICTION</h2>
            <p className="text-xs text-white/50 leading-relaxed">
              As a Healthcare professional, you are <span className="text-white font-bold">Strictly Forbidden</span> from uploading patient records, scans, or PII.
            </p>
            <div className="mt-4 p-4 bg-system-red/10 rounded-lg flex items-start gap-3 border border-system-red/20">
              <FileText className="text-system-red shrink-0" size={18} />
              <p className="text-[10px] text-system-red font-bold uppercase tracking-widest">Sovereign Compliance Check Active</p>
            </div>
          </div>
        </section>
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
