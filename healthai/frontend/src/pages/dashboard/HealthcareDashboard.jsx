import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, LogOut, Plus, Check, X, MapPin, Calendar } from 'lucide-react'

const MOCK_MY_POSTS = [
  { id: '1', title: 'AI-Assisted ECG Anomaly Detection', status: 'active', city: 'Ankara' },
  { id: '2', title: 'NLP Pipeline for Clinical Notes', status: 'meeting_scheduled', city: 'Ankara' },
  { id: '3', title: 'Retinal Image Segmentation', status: 'draft', city: 'Istanbul' },
]

const MOCK_MEETINGS = [
  { id: '1', engineer: 'Ahmet Çelik', project: 'AI-Assisted ECG Anomaly Detection', date: '2026-05-05', status: 'pending' },
  { id: '2', engineer: 'Fatma Yıldız', project: 'NLP Pipeline for Clinical Notes', date: '2026-05-07', status: 'pending' },
  { id: '3', engineer: 'Burak Şahin', project: 'Retinal Image Segmentation', date: '2026-05-10', status: 'accepted' },
]

const STATUS_CONFIG = {
  active: { label: 'Aktif', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  meeting_scheduled: { label: 'Toplantı Planlandı', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  partner_found: { label: 'Ortak Bulundu', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

export default function HealthcareDashboard() {
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState(MOCK_MEETINGS)
  const [showCreate, setShowCreate] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', domain: 'Kardiyoloji', city: 'Ankara', description: '' })

  const handleMeeting = (id, action) => {
    setMeetings(m => m.map(r => r.id === id ? { ...r, status: action } : r))
  }

  const handleCreateSubmit = () => {
    setShowCreate(false)
    setNewPost({ title: '', domain: 'Kardiyoloji', city: 'Ankara', description: '' })
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
            <span className="hidden sm:block text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
              Sağlık Profesyoneli
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Sağlık Profesyoneli Paneli</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            İlan Oluştur
          </button>
        </div>

        {/* İlanlarım */}
        <section>
          <h2 className="text-lg font-semibold mb-4">İlanlarım</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">İlan Adı</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Şehir</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_MY_POSTS.map((post, i) => (
                  <tr
                    key={post.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{post.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[post.status].color}`}>
                        {STATUS_CONFIG[post.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {post.city}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Toplantı İstekleri */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Toplantı İstekleri</h2>
          <div className="space-y-3">
            {meetings.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">{req.engineer}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{req.project}</div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {req.date}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleMeeting(req.id, 'accepted')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 text-xs font-medium transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Onayla
                      </button>
                      <button
                        onClick={() => handleMeeting(req.id, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-medium transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reddet
                      </button>
                    </>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      req.status === 'accepted'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {req.status === 'accepted' ? 'Onaylandı' : 'Reddedildi'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Create Post Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-5">İlan Oluştur</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">İlan Başlığı</label>
                <input
                  type="text"
                  placeholder="Projenizin başlığını girin"
                  value={newPost.title}
                  onChange={(e) => setNewPost(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Alan</label>
                  <select
                    value={newPost.domain}
                    onChange={(e) => setNewPost(p => ({ ...p, domain: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                  >
                    <option>Kardiyoloji</option>
                    <option>Radyoloji</option>
                    <option>Nöroloji</option>
                    <option>Onkoloji</option>
                    <option>Halk Sağlığı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Şehir</label>
                  <select
                    value={newPost.city}
                    onChange={(e) => setNewPost(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                  >
                    <option>Ankara</option>
                    <option>İstanbul</option>
                    <option>İzmir</option>
                    <option>Bursa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Açıklama</label>
                <textarea
                  rows={3}
                  placeholder="Proje açıklaması..."
                  value={newPost.description}
                  onChange={(e) => setNewPost(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleCreateSubmit}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
