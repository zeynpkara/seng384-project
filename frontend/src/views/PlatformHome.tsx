import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, FileText, Megaphone, Users } from 'lucide-react';
import { meetings as meetingsApi, posts as postsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: string;
  ownerId: string;
  title: string;
  domain: string;
  description: string;
  status: string;
  city: string;
  owner: { name: string; institution: string };
}

interface Meeting {
  id: string;
  status: string;
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className={`glass-panel rounded-xl p-6 border-l-4 ${tone}`}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</p>
      <p className="text-3xl text-white font-bold mt-3">{value}</p>
    </div>
  );
}

export default function PlatformHome() {
  const { user } = useAuth();
  const [spotlightPosts, setSpotlightPosts] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (!user) return;

    const ownerRole = user.role === 'HEALTHCARE' ? 'ENGINEER' : 'HEALTHCARE';

    void Promise.all([
      postsApi.getPosts({ limit: '4', ownerRole }) as Promise<Post[]>,
      postsApi.getMyPosts() as Promise<Post[]>,
      meetingsApi.getMyMeetings() as Promise<Meeting[]>,
    ]).then(([posts, mine, meetingList]) => {
      setSpotlightPosts(posts);
      setMyPosts(mine);
      setMeetings(meetingList);
    }).catch(() => {
      setSpotlightPosts([]);
      setMyPosts([]);
      setMeetings([]);
    });
  }, [user]);

  const roleCopy = useMemo(() => {
    if (user?.role === 'HEALTHCARE') {
      return {
        badge: 'Platform Home',
        title: 'Clinical collaboration starts with structured discovery',
        summary: 'Track your clinical needs, review active engineering opportunities, and move the strongest matches into external meetings.',
        discoverLabel: 'Explore engineer opportunities',
        createLabel: 'Create clinical need',
      };
    }

    return {
      badge: 'Platform Home',
      title: 'Find clinically validated problems worth building for',
      summary: 'See fresh healthcare opportunities, keep your technical posts visible, and move accepted matches toward real collaboration.',
      discoverLabel: 'Explore clinical challenges',
      createLabel: 'Post technical project',
    };
  }, [user]);

  const activePosts = myPosts.filter((post) => post.status === 'ACTIVE').length;
  const openMeetings = meetings.filter((meeting) => !['REJECTED', 'CANCELLED'].includes(meeting.status)).length;
  const nextActionCount = meetings.filter((meeting) => meeting.status === 'PENDING' || meeting.status === 'SLOTS_PROPOSED' || meeting.status === 'NDA_PENDING').length;

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8">
      <section className="glass-panel rounded-2xl p-8 md:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold">{roleCopy.badge}</p>
            </div>
            <h1 className="text-3xl md:text-5xl text-white font-bold leading-tight">{roleCopy.title}</h1>
            <p className="text-white/55 mt-4 max-w-2xl leading-relaxed">{roleCopy.summary}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/discover" className="px-5 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs uppercase tracking-widest font-bold transition-colors">
              {roleCopy.discoverLabel}
            </Link>
            <Link to="/my-posts?create=true" className="px-5 py-3 rounded-lg bg-primary text-on-primary text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity">
              {roleCopy.createLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Active Posts" value={activePosts} tone="border-l-primary" />
        <StatCard label="Open Meetings" value={openMeetings} tone="border-l-clinical-green" />
        <StatCard label="Needs Attention" value={nextActionCount} tone="border-l-tech-navy" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Opportunity Feed</p>
              <h2 className="text-2xl text-white font-semibold mt-2">Fresh opportunities across the platform</h2>
            </div>
            <Link to="/discover" className="text-primary text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2">
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spotlightPosts.map((post) => (
              <div key={post.id} className="glass-panel-elevated rounded-xl p-5 border border-white/5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] uppercase tracking-widest text-white/35">{post.domain}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/35">{post.city}</span>
                </div>
                <h3 className="text-white font-semibold mt-3">{post.title}</h3>
                <p className="text-white/45 text-xs mt-1">{post.owner.name} - {post.owner.institution}</p>
                <p className="text-sm text-white/60 mt-3 line-clamp-3">{post.description}</p>
              </div>
            ))}
            {spotlightPosts.length === 0 && (
              <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/3 p-8 text-center text-white/35">
                No public opportunities are available right now.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="text-primary" size={16} />
              <h3 className="text-white font-semibold">Platform Rules</h3>
            </div>
            <ul className="space-y-3 text-sm text-white/55 leading-relaxed">
              <li>No file uploads or document exchange inside the platform.</li>
              <li>No internal chat or video meetings. Real discussions happen externally.</li>
              <li>The product is for discovery, first contact, and meeting scheduling only.</li>
            </ul>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-primary" size={16} />
              <h3 className="text-white font-semibold">Quick Access</h3>
            </div>
            <div className="space-y-3 text-sm">
              <Link to="/my-posts" className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <span className="inline-flex items-center gap-2"><FileText size={14} /> Manage my posts</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/meetings" className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <span className="inline-flex items-center gap-2"><CalendarCheck size={14} /> Review meetings</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
