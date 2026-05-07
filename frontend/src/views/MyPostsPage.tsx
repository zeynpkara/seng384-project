import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, FilePenLine, Loader2, PlusSquare, Trash2 } from 'lucide-react';
import { posts as postsApi } from '../api/client';
import PostCreateModal, { PostFormValues } from '../components/PostCreateModal';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: string;
  title: string;
  domain: string;
  description: string;
  requiredExpertise: string;
  status: string;
  city: string;
  country: string;
  projectStage: string;
  confidentiality: 'PUBLIC' | 'MEETING_ONLY';
  commitmentLevel: string;
  createdAt: string;
}

const STATUS_ORDER = ['DRAFT', 'ACTIVE', 'MEETING_SCHEDULED', 'CLOSED'];

export default function MyPostsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const accent = user?.role === 'HEALTHCARE' ? 'clinical-green' : 'tech-navy';
  const title = user?.role === 'HEALTHCARE' ? 'My Clinical Needs' : 'My Technical Posts';
  const subtitle = user?.role === 'HEALTHCARE'
    ? 'Manage the opportunities you publish for technical partners.'
    : 'Manage the technical collaborations you publish for clinical partners.';

  const loadMyPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postsApi.getMyPosts() as Post[];
      setMyPosts(data);
    } catch {
      setMyPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    void loadMyPosts();
  }, [loadMyPosts]);

  const sortedPosts = useMemo(() => {
    return [...myPosts].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
  }, [myPosts]);

  const runPostAction = async (postId: string, action: 'publish' | 'close' | 'delete') => {
    setBusyPostId(postId);
    setMessage('');
    try {
      if (action === 'publish') await postsApi.publishPost(postId);
      if (action === 'close') await postsApi.closePost(postId);
      if (action === 'delete') await postsApi.deletePost(postId);
      setMessage(action === 'delete' ? 'Draft deleted successfully.' : 'Post updated successfully.');
      await loadMyPosts();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyPostId(null);
    }
  };

  const editableStatuses = new Set(['DRAFT', 'ACTIVE']);

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full bg-${accent} animate-pulse`} />
            <p className={`text-[10px] uppercase tracking-[0.2em] text-${accent} font-bold`}>Workspace</p>
          </div>
          <h1 className="text-3xl md:text-5xl text-white font-bold">{title}</h1>
          <p className="text-white/50 mt-3 max-w-2xl">{subtitle}</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className={`glass-panel-elevated bg-${accent}/10 hover:bg-${accent}/20 text-${accent} border-${accent}/30 px-8 py-4 rounded-lg text-sm tracking-widest transition-all duration-300 flex items-center gap-3 font-bold uppercase`}
        >
          <PlusSquare size={18} />
          <span>Create Post</span>
        </button>
      </div>

      {message && (
        <div className={`rounded-xl px-5 py-4 text-sm border ${message.includes('successfully') ? `bg-${accent}/10 border-${accent}/20 text-${accent}` : 'bg-red-400/10 border-red-400/20 text-red-400'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['DRAFT', 'ACTIVE', 'MEETING_SCHEDULED', 'CLOSED'].map((status) => (
          <div key={status} className="glass-panel rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{status.replace('_', ' ')}</p>
            <p className="text-3xl text-white font-bold mt-3">{myPosts.filter((post) => post.status === status).length}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((item) => <div key={item} className="h-28 rounded-xl bg-white/5 animate-pulse" />)
        ) : sortedPosts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 text-center text-white/35">
            You have not created a post yet.
          </div>
        ) : (
          sortedPosts.map((post) => (
            <div key={post.id} className="glass-panel rounded-2xl p-6 md:p-7">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${post.status === 'ACTIVE' ? `bg-${accent}/10 text-${accent}` : post.status === 'MEETING_SCHEDULED' ? 'bg-clinical-green/10 text-clinical-green' : 'bg-white/5 text-white/45'}`}>
                      {post.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/30">{post.domain} - {post.city}</span>
                  </div>
                  <div>
                    <h2 className="text-xl text-white font-semibold">{post.title}</h2>
                    <p className="text-sm text-white/55 mt-2 line-clamp-3">{post.description}</p>
                    <p className="text-[11px] text-white/35 mt-3 uppercase tracking-widest">
                      {post.projectStage.replace('_', ' ')} · {post.commitmentLevel} · {post.confidentiality === 'MEETING_ONLY' ? 'Meeting Only' : 'Public'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 lg:justify-end">
                  {editableStatuses.has(post.status) && (
                    <button
                      onClick={() => setEditingPost(post)}
                      disabled={busyPostId === post.id}
                      className="px-4 py-2 rounded-lg bg-white/5 text-white/70 border border-white/10 text-xs uppercase tracking-widest font-bold hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      <FilePenLine size={12} />
                      Edit
                    </button>
                  )}
                  {post.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => void runPostAction(post.id, 'publish')}
                        disabled={busyPostId === post.id}
                        className={`px-4 py-2 rounded-lg bg-${accent} text-white text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2`}
                      >
                        {busyPostId === post.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Publish
                      </button>
                      <button
                        onClick={() => void runPostAction(post.id, 'delete')}
                        disabled={busyPostId === post.id}
                        className="px-4 py-2 rounded-lg bg-system-red/10 text-system-red border border-system-red/20 text-xs uppercase tracking-widest font-bold hover:bg-system-red hover:text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        <Trash2 size={12} />
                        Delete Draft
                      </button>
                    </>
                  )}
                  {post.status === 'MEETING_SCHEDULED' && (
                    <button
                      onClick={() => void runPostAction(post.id, 'close')}
                      disabled={busyPostId === post.id}
                      className="px-4 py-2 rounded-lg bg-clinical-green text-white text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {busyPostId === post.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                      Mark Partner Found
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PostCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={() => void loadMyPosts()} />
      <PostCreateModal
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onCreated={() => {
          setEditingPost(null);
          void loadMyPosts();
        }}
        mode="edit"
        postId={editingPost?.id}
        initialValues={editingPost ? ({
          title: editingPost.title,
          domain: editingPost.domain,
          description: editingPost.description,
          requiredExpertise: editingPost.requiredExpertise,
          projectStage: editingPost.projectStage,
          confidentiality: editingPost.confidentiality,
          city: editingPost.city,
          country: editingPost.country,
          commitmentLevel: editingPost.commitmentLevel,
        } satisfies Partial<PostFormValues>) : null}
      />
    </div>
  );
}
