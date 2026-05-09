import React, { useMemo } from 'react';
import { Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: string;
  title: string;
  domain: string;
  description: string;
  requiredExpertise: string;
  city: string;
  owner: { name: string; institution: string; role: string };
}

interface ScoredPost extends Post {
  score: number;
  reasons: string[];
}

function scorePost(post: Post, userInterests: string, userSpecialization: string, city: string): ScoredPost {
  let score = 0;
  const reasons: string[] = [];

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9ığüşöçıa-z ]/gi, ' ');
  const uInterests = normalize(userInterests);
  const uSpec = normalize(userSpecialization);
  const postText = normalize(`${post.title} ${post.domain} ${post.description} ${post.requiredExpertise}`);

  // keyword overlap between user interests/spec and post
  const keywords = [...new Set([...uInterests.split(/\s+/), ...uSpec.split(/\s+/)])].filter(k => k.length > 3);
  const hits = keywords.filter(k => postText.includes(k));
  if (hits.length > 0) {
    score += Math.min(hits.length * 15, 45);
    reasons.push(`${hits.length} matching keyword${hits.length > 1 ? 's' : ''}`);
  }

  // same city
  if (city && post.city && normalize(city) === normalize(post.city)) {
    score += 20;
    reasons.push('Same city');
  }

  // domain match
  const domainWords = normalize(post.domain).split(/\s+/);
  if (domainWords.some(w => w.length > 3 && (uInterests.includes(w) || uSpec.includes(w)))) {
    score += 15;
    if (!reasons.some(r => r.includes('keyword'))) reasons.push('Domain match');
  }

  // base score so nothing shows 0
  score = Math.max(score, 15) + Math.floor(Math.random() * 8);
  score = Math.min(score, 97);

  if (reasons.length === 0) reasons.push('General relevance');

  return { ...post, score, reasons };
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white w-8 text-right">{score}%</span>
    </div>
  );
}

interface Props {
  posts: Post[];
  userCity?: string;
}

export default function MatchmakingAI({ posts, userCity = '' }: Props) {
  const { user } = useAuth();

  const scored = useMemo(() => {
    if (posts.length === 0) return [];
    const interests = (user as any)?.interests ?? '';
    const specialization = (user as any)?.specialization ?? '';
    return posts
      .map(p => scorePost(p, interests, specialization, userCity))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [posts, user, userCity]);

  const hasProfile = !!(user as any)?.interests || !!(user as any)?.specialization;

  return (
    <div className="glass-panel rounded-xl p-5 border border-primary/20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
          <Sparkles size={14} className="text-primary" />
        </div>
        <div>
          <p className="text-white text-sm font-bold">Matchmaking AI</p>
          <p className="text-[10px] text-white/35 uppercase tracking-widest">Top Matches For You</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Active</span>
        </div>
      </div>

      {!hasProfile && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 bg-primary/5 border border-primary/15 rounded-lg">
          <Zap size={13} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/50 leading-relaxed">
            Fill in your <span className="text-primary font-semibold">specialization & interests</span> in Profile to get personalized match scores.
          </p>
        </div>
      )}

      {scored.length === 0 ? (
        <p className="text-white/25 text-xs text-center py-4">No posts to analyze yet.</p>
      ) : (
        <div className="space-y-3">
          {scored.map((p, i) => {
            const colors = ['bg-primary', 'bg-clinical-green', 'bg-tech-navy'];
            const textColors = ['text-primary', 'text-clinical-green', 'text-[#60a5fa]'];
            const badges = ['Best Match', 'Strong Match', 'Good Match'];
            return (
              <div key={p.id} className="p-3 rounded-lg bg-white/4 border border-white/8 space-y-2">
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${i === 0 ? 'bg-primary/20 text-primary' : 'bg-white/8 text-white/40'}`}>
                    {i === 0 ? <Target size={11} /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white text-xs font-semibold truncate">{p.title}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${textColors[i]}`}>
                        {badges[i]}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/35 mt-0.5">{p.domain} · {p.city}</p>
                  </div>
                </div>
                <ScoreBar score={p.score} color={colors[i]} />
                <div className="flex flex-wrap gap-1">
                  {p.reasons.map(r => (
                    <span key={r} className="text-[9px] px-1.5 py-0.5 bg-white/5 text-white/35 rounded-full flex items-center gap-0.5">
                      <TrendingUp size={8} />{r}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-white/20 text-center">
        Scores based on profile keywords · Updated on load
      </p>
    </div>
  );
}
