import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, LogOut, Users, FileText, Ban, Trash2, Shield } from 'lucide-react'

const MOCK_USERS = [
  { id: '1', name: 'Dr. Ayşe Kaya', email: 'ayse.kaya@hacettepe.edu.tr', role: 'healthcare', institution: 'Hacettepe University', status: 'active' },
  { id: '2', name: 'Ahmet Çelik', email: 'ahmet.celik@metu.edu.tr', role: 'engineer', institution: 'METU', status: 'active' },
  { id: '3', name: 'Prof. Mehmet Demir', email: 'mehmet.demir@istanbul.edu.tr', role: 'healthcare', institution: 'Istanbul University', status: 'active' },
  { id: '4', name: 'Fatma Yıldız', email: 'fatma.yildiz@itu.edu.tr', role: 'engineer', institution: 'ITU', status: 'blocked' },
  { id: '5', name: 'Dr. Zeynep Arslan', email: 'zeynep.arslan@ege.edu.tr', role: 'healthcare', institution: 'Ege University', status: 'active' },
  { id: '6', name: 'Burak Şahin', email: 'burak.sahin@bilkent.edu.tr', role: 'engineer', institution: 'Bilkent University', status: 'active' },
]

const MOCK_POSTS = [
  { id: '1', title: 'AI-Assisted ECG Anomaly Detection', owner: 'Dr. Ayşe Kaya', domain: 'Cardiology', city: 'Ankara', status: 'active' },
  { id: '2', title: 'Retinal Image Segmentation', owner: 'Prof. Mehmet Demir', domain: 'Radiology', city: 'Istanbul', status: 'active' },
  { id: '3', title: 'NLP Pipeline for Clinical Notes', owner: 'Dr. Zeynep Arslan', domain: 'Public Health', city: 'Izmir', status: 'meeting_scheduled' },
  { id: '4', title: 'Predictive Modeling for Sepsis', owner: 'Dr. Emre Yılmaz', domain: 'Oncology', city: 'Ankara', status: 'active' },
]

const ROLE_CONFIG = {
  healthcare: { label: 'Sağlık', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  engineer: { label: 'Mühendis', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
}

const POST_STATUS = {
  active: { label: 'Aktif', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  meeting_scheduled: { label: 'Toplantı Planlandı', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState(MOCK_USERS)
  const [posts, setPosts] = useState(MOCK_POSTS)

  const toggleBlock = (id) => {
    setUsers(u => u.map(user =>
      user.id === id
        ? { ...user, status: user.status === 'blocked' ? 'active' : 'blocked' }
        : user
    ))
  }

  const deletePost = (id) => {
    setPosts(p => p.filter(post => post.id !== id))
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
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium">
              <Shield className="h-3 w-3" />
              Yönetici
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
          <h1 className="text-2xl font-bold">Yönetici Paneli</h1>
          <p className="text-sm text-muted-foreground mt-1">Sistemdeki kullanıcıları ve ilanları yönetin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Kullanıcı', value: users.length, icon: Users, color: 'text-blue-600' },
            { label: 'Aktif İlan', value: posts.length, icon: FileText, color: 'text-green-600' },
            { label: 'Engellenen', value: users.filter(u => u.status === 'blocked').length, icon: Ban, color: 'text-red-600' },
            { label: 'Sağlık Prof.', value: users.filter(u => u.role === 'healthcare').length, icon: Activity, color: 'text-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Kullanıcılar */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Kullanıcılar</h2>
          </div>
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ad Soyad</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-posta</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kurum</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_CONFIG[user.role]?.color}`}>
                        {ROLE_CONFIG[user.role]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{user.institution}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.status === 'active' ? 'Aktif' : 'Engellendi'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleBlock(user.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.status === 'active'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                            : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                        }`}
                      >
                        <Ban className="h-3.5 w-3.5" />
                        {user.status === 'active' ? 'Engelle' : 'Engeli Kaldır'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* İlanlar */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">İlanlar</h2>
          </div>
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">İlan Başlığı</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">İlan Sahibi</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Alan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Şehir</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Sistemde ilan bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  posts.map((post, i) => (
                    <tr
                      key={post.id}
                      className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{post.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{post.owner}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {post.domain}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{post.city}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${POST_STATUS[post.status]?.color}`}>
                          {POST_STATUS[post.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deletePost(post.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
