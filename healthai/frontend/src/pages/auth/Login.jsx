import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Heart, Cpu, Shield, ChevronRight } from 'lucide-react'

const ROLES = [
  {
    id: 'healthcare',
    label: 'Healthcare',
    sublabel: 'Sağlık Profesyoneli',
    icon: Heart,
    description: 'İlan oluşturun, toplantı isteklerini yönetin',
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
    cardBg: 'bg-green-50/50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800',
    href: '/dashboard/healthcare',
  },
  {
    id: 'engineer',
    label: 'Engineer',
    sublabel: 'Mühendis',
    icon: Cpu,
    description: 'İlanları keşfedin, projelere başvurun',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    cardBg: 'bg-blue-50/50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    href: '/dashboard/engineer',
  },
  {
    id: 'admin',
    label: 'Admin',
    sublabel: 'Yönetici',
    icon: Shield,
    description: 'Kullanıcıları ve ilanları yönetin',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
    cardBg: 'bg-purple-50/50 dark:bg-purple-900/10',
    border: 'border-purple-200 dark:border-purple-800',
    href: '/dashboard/admin',
  },
]

export default function Login() {
  const [showPicker, setShowPicker] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8 font-bold text-xl">
          <Activity className="h-6 w-6 text-primary" />
          <span>HEALTH<span className="text-primary">AI</span></span>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          {!showPicker ? (
            <>
              <h1 className="text-xl font-bold mb-1">Hoş Geldiniz</h1>
              <p className="text-sm text-muted-foreground mb-8">
                HEALTH AI platformuna erişmek için giriş yapın.
              </p>
              <button
                onClick={() => setShowPicker(true)}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Giriş Yap
              </button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-1">Rol Seçin</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Devam etmek istediğiniz rolü seçin.
              </p>
              <div className="space-y-3">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => navigate(role.href)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border ${role.border} ${role.cardBg} hover:opacity-80 transition-all text-left group`}
                  >
                    <div className={`h-10 w-10 rounded-lg ${role.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <role.icon className={`h-5 w-5 ${role.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm">{role.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{role.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                ← Geri
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
