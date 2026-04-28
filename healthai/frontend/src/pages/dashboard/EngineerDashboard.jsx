import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, LogOut, Search, MapPin, Beaker } from 'lucide-react'
import { DOMAINS, CITIES } from '@/constants'

const MOCK_POSTS = [
  {
    id: '1',
    title: 'AI-Assisted ECG Anomaly Detection',
    domain: 'Cardiology',
    expertise_req: 'Machine Learning Engineer',
    project_stage: 'prototype',
    city: 'Ankara',
    description: 'We are developing an AI model to detect arrhythmia from 12-lead ECG data. Looking for an ML engineer with signal processing experience.',
    owner: { full_name: 'Dr. Ayşe Kaya', institution: 'Hacettepe University' },
  },
  {
    id: '2',
    title: 'Retinal Image Segmentation for Diabetic Retinopathy',
    domain: 'Radiology',
    expertise_req: 'Computer Vision Engineer',
    project_stage: 'research',
    city: 'Istanbul',
    description: 'Research project aiming to automate grading of diabetic retinopathy using deep learning on fundus photographs.',
    owner: { full_name: 'Prof. Mehmet Demir', institution: 'Istanbul University' },
  },
  {
    id: '3',
    title: 'NLP Pipeline for Clinical Note Summarization',
    domain: 'Public Health',
    expertise_req: 'NLP Engineer',
    project_stage: 'idea',
    city: 'Izmir',
    description: 'Building a pipeline to extract structured data from unstructured clinical notes using transformer-based NLP models.',
    owner: { full_name: 'Dr. Zeynep Arslan', institution: 'Ege University' },
  },
  {
    id: '4',
    title: 'Predictive Modeling for Sepsis Early Warning',
    domain: 'Oncology',
    expertise_req: 'Data Scientist',
    project_stage: 'clinical_trial',
    city: 'Ankara',
    description: 'Using ICU time-series data to train a model that predicts sepsis onset 6 hours in advance.',
    owner: { full_name: 'Dr. Emre Yılmaz', institution: 'METU Medical School' },
  },
]

const MOCK_APPLICATIONS = [
  { id: '1', project: 'AI-Assisted ECG Anomaly Detection', owner: 'Dr. Ayşe Kaya', applied_at: '2026-04-22', status: 'pending' },
  { id: '2', project: 'Retinal Image Segmentation', owner: 'Prof. Mehmet Demir', applied_at: '2026-04-20', status: 'accepted' },
  { id: '3', project: 'NLP Pipeline for Clinical Notes', owner: 'Dr. Zeynep Arslan', applied_at: '2026-04-18', status: 'pending' },
]

const STAGE_LABELS = {
  idea: 'Fikir',
  research: 'Araştırma',
  prototype: 'Prototip',
  clinical_trial: 'Klinik Deneme',
}

export default function EngineerDashboard() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('')
  const [city, setCity] = useState('')
  const [interested, setInterested] = useState(new Set())

  const filtered = MOCK_POSTS.filter((p) => {
    const q = search.toLowerCase()
    return (
      (!search || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
      (!domain || p.domain === domain) &&
      (!city || p.city === city)
    )
  })

  const toggleInterest = (id) => {
    setInterested(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Activity className="h-5 w-5 text-primary" />
            <span>HEALTH<span className="text-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
              Mühendis
            </span>
            <button
              onClick={() => navigate('/login')}
              className="h-9 px-3 flex items-center gap-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Mühendis Paneli — İlanları keşfedin ve projelere katılın</p>
        </div>

        {/* İlan Keşfi */}
        <section>
          <h2 className="text-lg font-semibold mb-4">İlan Keşfi</h2>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="İlan ara..."
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
              <option value="">Tüm Alanlar</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
            >
              <option value="">Tüm Şehirler</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {(search || domain || city) && (
              <button
                onClick={() => { setSearch(''); setDomain(''); setCity('') }}
                className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors text-muted-foreground"
              >
                Temizle
              </button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} ilan bulundu
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Aktif
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1 leading-snug">{post.title}</h3>
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
                  <button
                    onClick={() => toggleInterest(post.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      interested.has(post.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {interested.has(post.id) ? '✓ İlgilendi' : 'İlgileniyorum'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Başvurularım */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Başvurularım</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Proje</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">İlan Sahibi</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Başvuru Tarihi</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_APPLICATIONS.map((app, i) => (
                  <tr
                    key={app.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{app.project}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{app.owner}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{app.applied_at}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.status === 'accepted'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {app.status === 'accepted' ? 'Onaylandı' : 'Bekliyor'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
