import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Compass, Loader2, ShieldCheck, Users, Video } from 'lucide-react';

const PLATFORM_BADGE: Record<string, { label: string; cls: string }> = {
  ZOOM: { label: 'Zoom', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  GOOGLE_MEET: { label: 'Meet', cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  TEAMS: { label: 'Teams', cls: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  OTHER: { label: '', cls: '' },
};
import { meetings as meetingsApi, posts as postsApi } from '../api/client';
import FilterBar from '../components/FilterBar';
import MeetingsDashboard from '../components/MeetingsDashboard';
import NdaModal from '../components/NdaModal';
import MatchmakingAI from '../components/MatchmakingAI';
import { useAuth } from '../context/AuthContext';

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
  owner: { name: string; institution: string; role: string };
}

interface Meeting {
  id: string;
  status: string;
  post: { id: string };
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [interestLoading, setInterestLoading] = useState<string | null>(null);
  const [interestDone, setInterestDone] = useState<Set<string>>(new Set());
  const [meetingsRefresh, setMeetingsRefresh] = useState(0);
  const [ndaModal, setNdaModal] = useState<{ open: boolean; meetingId: string; postId: string }>({ open: false, meetingId: '', postId: '' });
  const [message, setMessage] = useState('');

  const accent = user?.role === 'HEALTHCARE' ? 'clinical-green' : 'tech-navy';
  const ownerRole = user?.role === 'HEALTHCARE' ? 'ENGINEER' : 'HEALTHCARE';

  const heading = useMemo(() => {
    if (user?.role === 'HEALTHCARE') {
      return {
        title: 'Discover Engineering Partners',
        summary: 'Browse structured technical opportunities and express interest only when you are ready to move toward a real meeting.',
      };
    }

    return {
      title: 'Discover Clinical Challenges',
      summary: 'Review healthcare needs, accept the NDA when required, and move qualified opportunities into external meetings.',
    };
  }, [user]);

  const loadFeed = useCallback(async (filters: Record<string, string> = {}) => {
    setFeedLoading(true);
    try {
      const [data, myMeetings] = await Promise.all([
        postsApi.getPosts({ limit: '12', ownerRole, ...filters }) as Promise<Post[]>,
        meetingsApi.getMyMeetings() as Promise<Meeting[]>,
      ]);
      setFeed(data);
      setInterestDone(new Set(myMeetings.map((meeting) => meeting.post.id)));
    } catch {
      setFeed([]);
      setInterestDone(new Set());
    } finally {
      setFeedLoading(false);
    }
  }, [ownerRole]);

  useEffect(() => {
    void loadFeed(activeFilters);
  }, [activeFilters, loadFeed, meetingsRefresh]);

  const handleExpressInterest = async (postId: string) => {
    setInterestLoading(postId);
    setMessage('');
    try {
      const check = await meetingsApi.checkInterest(postId);
      if (check.hasInterest) {
        setInterestDone((prev) => new Set(prev).add(postId));
        setMessage('You have already expressed interest in this post.');
        return;
      }

      const res = await meetingsApi.expressInterest(postId, {});
      if (res.requiresNDA) {
        setNdaModal({ open: true, meetingId: res.meetingId, postId });
      } else {
        setInterestDone((prev) => new Set(prev).add(postId));
        setMessage('Interest submitted. Continue the process from Meetings when slots are proposed.');
        setMeetingsRefresh((value) => value + 1);
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to express interest');
    } finally {
      setInterestLoading(null);
    }
  };

  const handleNdaAccepted = () => {
    setInterestDone((prev) => new Set(prev).add(ndaModal.postId));
    setMessage('NDA accepted and interest submitted. Continue in Meetings when the other side proposes slots.');
    setMeetingsRefresh((value) => value + 1);
    setNdaModal({ open: false, meetingId: '', postId: '' });
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full bg-${accent} animate-pulse`} />
            <p className={`text-[10px] uppercase tracking-[0.2em] text-${accent} font-bold`}>Discovery</p>
          </div>
          <h1 className="text-3xl md:text-5xl text-white font-bold">{heading.title}</h1>
          <p className="text-white/50 mt-3 max-w-3xl">{heading.summary}</p>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl px-5 py-4 text-sm border ${message.toLowerCase().includes('failed') ? 'bg-red-400/10 border-red-400/20 text-red-400' : `bg-${accent}/10 border-${accent}/20 text-${accent}`}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 space-y-6">
          <FilterBar onChange={setActiveFilters} accentColor={accent} />

          {feedLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => <div key={item} className="h-36 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          ) : feed.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center text-white/35">
              No posts match the current filters.
            </div>
          ) : (
            <div className="space-y-5">
              {feed.map((post) => {
                const done = interestDone.has(post.id);
                const loading = interestLoading === post.id;
                const isOwn = user?.id === post.ownerId;

                return (
                  <div key={post.id} className="glass-panel rounded-2xl p-6 md:p-7">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.role === 'HEALTHCARE' ? 'bg-tech-navy/10' : 'bg-clinical-green/10'}`}>
                            <Users className={user?.role === 'HEALTHCARE' ? 'text-tech-navy' : 'text-clinical-green'} size={18} />
                          </span>
                          <div>
                            <h2 className="text-xl text-white font-semibold">{post.title}</h2>
                            <p className="text-sm text-white/45">{post.owner.name} - {post.owner.institution}</p>
                          </div>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{post.description}</p>
                        <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-widest text-white/30 items-center">
                          <span>{post.domain}</span>
                          <span>{post.requiredExpertise}</span>
                          <span>{post.city}</span>
                          {post.preferredPlatform && post.preferredPlatform !== 'OTHER' && (() => {
                            const p = PLATFORM_BADGE[post.preferredPlatform];
                            return p ? (
                              <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border font-bold normal-case tracking-normal ${p.cls}`}>
                                <Video size={9} />{p.label}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      {!isOwn && post.status === 'ACTIVE' && (
                        <button
                          onClick={() => void handleExpressInterest(post.id)}
                          disabled={loading || done}
                          className={`shrink-0 px-4 py-3 rounded-lg text-xs uppercase tracking-widest font-bold transition-opacity disabled:opacity-50 inline-flex items-center gap-2 ${user?.role === 'HEALTHCARE' ? 'bg-tech-navy text-white' : 'bg-clinical-green text-white'}`}
                        >
                          {loading ? <Loader2 size={12} className="animate-spin" /> : done ? <CheckCircle2 size={12} /> : <Compass size={12} />}
                          {done ? 'Interest Sent' : 'Express Interest'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="lg:col-span-4">
          <div className="space-y-6">
            {user && feed.length > 0 && (
              <MatchmakingAI posts={feed} />
            )}

            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">How Discovery Works</h2>
              <ul className="space-y-3 text-sm text-white/55 leading-relaxed">
                <li>Review the structured post before expressing interest.</li>
                <li>Accept the one-time NDA when the platform requires it.</li>
                <li>Move the conversation into an external meeting after slots are confirmed.</li>
              </ul>
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/45 font-bold">
                  <ShieldCheck size={12} />
                  No files. No internal chat. No patient data.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-5">Meeting Flow</h2>
              {user ? (
                <MeetingsDashboard userId={user.id} refreshKey={meetingsRefresh} />
              ) : (
                <p className="text-white/30 text-sm">Log in to see meetings.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <NdaModal
        isOpen={ndaModal.open}
        meetingId={ndaModal.meetingId}
        onAccepted={handleNdaAccepted}
        onCancel={() => setNdaModal({ open: false, meetingId: '', postId: '' })}
      />
    </div>
  );
}
