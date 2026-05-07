import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import { auth } from '../api/client';

type VerifyState = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setState('error');
      setMessage('Verification link is missing a token.');
      return;
    }

    let cancelled = false;

    auth.verifyEmail(token)
      .then((response) => {
        if (cancelled) return;
        const result = response as { message?: string };
        setState('success');
        setMessage(result.message || 'Email verified. You can now log in.');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed.');
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const isLoading = state === 'loading';
  const isSuccess = state === 'success';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="glass-panel max-w-md w-full rounded-2xl border border-white/20 p-8 text-center">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border ${
          isLoading
            ? 'border-white/15 bg-white/5'
            : isSuccess
              ? 'border-clinical-green/30 bg-clinical-green/10'
              : 'border-system-red/30 bg-system-red/10'
        }`}>
          {isLoading && <Loader2 className="animate-spin text-white/70" size={28} />}
          {isSuccess && <ShieldCheck className="text-clinical-green" size={28} />}
          {!isLoading && !isSuccess && <ShieldX className="text-system-red" size={28} />}
        </div>

        <h1 className="mb-3 text-2xl font-bold text-white">
          {isLoading ? 'Verifying Email' : isSuccess ? 'Email Verified' : 'Verification Failed'}
        </h1>

        <p className="mb-6 text-sm leading-relaxed text-white/55">
          {message}
        </p>

        <div className="flex justify-center">
          <Link
            to="/"
            className="rounded-lg bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-90"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
