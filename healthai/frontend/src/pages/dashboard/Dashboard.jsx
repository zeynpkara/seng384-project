import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, MapPin, Beaker, SlidersHorizontal } from 'lucide-react'
import { POST_STATUS_CONFIG, DOMAINS, CITIES } from '@/constants'
import { cn } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'

const MOCK_POSTS = [
  {
    id: '1',
    title: 'AI-Assisted ECG Anomaly Detection',
    domain: 'Cardiology',
    expertise_req: 'Machine Learning Engineer',
    project_stage: 'prototype',
    confidentiality: 'public',
    city: 'Ankara',
    description: 'We are developing an AI model to detect arrhythmia from 12-lead ECG data. Looking for an ML engineer with signal processing experience.',
    status: 'active',
    owner: { full_name: 'Dr. Ayşe Kaya', institution: 'Hacettepe University' },
    created_at: '2026-04-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Retinal Image Segmentation for Diabetic Retinopathy',
    domain: 'Radiology',
    expertise_req: 'Computer Vision Engineer',
    project_stage: 'research',
    confidentiality: 'nda',
    city: 'Istanbul',
    description: 'Research project aiming to automate grading of diabetic retinopathy using deep learning on fundus photographs.',
    status: 'active',
    owner: { full_name: 'Prof. Mehmet Demir', institution: 'Istanbul University' },
    created_at: '2026-04-18T14:30:00Z',
  },
  {
    id: '3',
    title: 'NLP Pipeline for Clinical Note Summarization',
    domain: 'Public Health',
    expertise_req: 'NLP Engineer',
    project_stage: 'idea',
    confidentiality: 'public',
    city: 'Izmir',
    description: 'Building a pipeline to extract structured data from unstructured clinical notes using transformer-based NLP models.',
    status: 'meeting_scheduled',
    owner: { full_name: 'Dr. Zeynep Arslan', institution: 'Ege University' },
    created_at: '2026-04-15T09:00:00Z',
  },
  {
    id: '4',
    title: 'Predictive Modeling for Sepsis Early Warning',
    domain: 'Oncology',
    expertise_req: 'Data Scientist',
    project_stage: 'clinical_trial',
    confidentiality: 'nda',
    city: 'Ankara',
    description: 'Using ICU time-series data to train a model that predicts sepsis onset 6 hours in advance.',
    status: 'active',
    owner: { full_name: 'Dr. Emre Yılmaz', institution: 'METU Medical School' },
    created_at: '2026-04-10T11:00:00Z',
  },
]

const STAGE_LABELS = {
  idea: 'Idea',
  research: 'Research',
  prototype: 'Prototype',
  clinical_trial: 'Clinical Trial',
}

function PostCard({ post }) {
  const statusCfg = POST_STATUS_CONFIG[post.status]
  return (
    <Link
      to={`/posts/${post.id}`}
      className="group block bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.color)}>
          {statusCfg.label}
        </span>
        {post.confidentiality === 'nda' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            NDA
          </span>
        )}
      </div>

      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2">
        {post.title}
      </h3>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{post.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
          {post.domain}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">
          <Beaker className="h-3 w-3" />
          {STAGE_LABELS[post.project_stage]}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">
          <MapPin className="h-3 w-3" />
          {post.city}
        </span>
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-foreground">{post.owner.full_name}</div>
          <div className="text-xs text-muted-foreground">{post.owner.institution}</div>
        </div>
        <div className="text-xs text-muted-foreground">
          Seeks: <span className="font-medium text-foreground">{post.expertise_req}</span>
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('')
  const [city, setCity] = useState('')

  const filtered = MOCK_POSTS.filter((p) => {
    const q = search.toLowerCase()
    return (
      (!search || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
      (!domain || p.domain === domain) &&
      (!city || p.city === city)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Discover Collaborations</h1>
            <p className="text-sm text-muted-foreground mt-1">Find healthcare professionals and engineers to work with</p>
          </div>
          <Link
            to="/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
          >
            <option value="">All Domains</option>
            {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
          >
            <option value="">All Cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || domain || city) && (
            <button
              onClick={() => { setSearch(''); setDomain(''); setCity('') }}
              className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors text-muted-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} post{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <SlidersHorizontal className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No posts match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </main>
    </div>
  )
}
