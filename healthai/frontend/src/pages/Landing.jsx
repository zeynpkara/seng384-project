import { Link } from 'react-router-dom'
import { Activity, ArrowRight, Shield, Users, Zap } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Structured Matching',
    description: 'Connect healthcare professionals with engineers through domain-specific, city-aware discovery.',
  },
  {
    icon: Shield,
    title: 'NDA-Ready Workflow',
    description: 'Confidential projects stay private. Built-in NDA acceptance before collaboration details are shared.',
  },
  {
    icon: Zap,
    title: 'Meeting Coordination',
    description: 'Propose time slots, confirm meetings, and get notified — all in one place.',
  },
]

const stats = [
  { label: 'Domains Covered', value: '15+' },
  { label: 'Cities', value: '10+' },
  { label: 'Roles Supported', value: '2' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="w-full border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Activity className="h-5 w-5 text-primary" />
            <span>HEALTH<span className="text-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors">
              Log in
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6">
            <Activity className="h-3 w-3" />
            For .edu institutions only
          </span>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-6 max-w-3xl">
            Where Healthcare Meets{' '}
            <span className="text-primary">Engineering</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            HEALTH AI connects healthcare professionals with engineers to co-create the next generation of health technology — structured, private, and purpose-built.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:gap-3">
              Start Collaborating <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="px-6 py-3 rounded-lg border border-border font-medium hover:bg-accent transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-8 max-w-sm mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Everything you need to collaborate</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to find your collaborator?</h2>
        <p className="text-muted-foreground mb-8">Join with your institutional email and start discovering.</p>
        <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
          Create Free Account <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Activity className="h-3 w-3 text-primary" />
          <span className="font-medium">HEALTH AI</span>
        </div>
        No patient data is stored on this platform. Institutional .edu emails required.
      </footer>
    </div>
  )
}
