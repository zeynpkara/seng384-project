import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Activity, CheckCircle2, Loader2, MailOpen, XCircle } from 'lucide-react'
import { authService } from '@/services/authService'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState(token ? 'verifying' : 'pending')
  const [email, setEmail] = useState('')
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (!token) return
    authService.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  const resend = async () => {
    if (!email) return
    await authService.resendVerification(email).catch(() => {})
    setResent(true)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center gap-2 justify-center mb-8 font-bold text-xl">
          <Activity className="h-6 w-6 text-primary" />
          <span>HEALTH<span className="text-primary">AI</span></span>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-semibold">Verifying your email…</h2>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Email verified!</h2>
              <p className="text-sm text-muted-foreground mb-6">Your account is ready.</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                Go to Sign In
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Link expired or invalid</h2>
              <p className="text-sm text-muted-foreground mb-4">Request a new verification link below.</p>
            </>
          )}
          {status === 'pending' && (
            <>
              <MailOpen className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mb-4">
                We sent a verification link to your email. Click it to activate your account.
              </p>
            </>
          )}

          {(status === 'pending' || status === 'error') && !resent && (
            <div className="mt-2 space-y-2">
              <input
                type="email"
                placeholder="your@university.edu.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
              <button
                onClick={resend}
                className="w-full py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                Resend verification email
              </button>
            </div>
          )}
          {resent && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400">
              If that email exists, a new link has been sent.
            </p>
          )}

          <div className="mt-6 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">← Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
