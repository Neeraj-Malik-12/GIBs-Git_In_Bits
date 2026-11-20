import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Code, CheckCircle2, Clock } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';

type ServerStatus = 'checking' | 'ready' | 'waking';

export function Login() {
  const { user, login } = useAuth();
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: number | null = null;
    let abortController: AbortController | null = null;

    const checkServerHealth = async () => {
      try {
        abortController = new AbortController();
        // Give Render up to 45 seconds to respond if it is mid-wake
        const abortTimeout = setTimeout(() => abortController?.abort(), 45000);

        const res = await fetch(`${API_BASE_URL}/health`, {
          signal: abortController.signal,
          headers: { 'Accept': 'application/json' },
        });
        clearTimeout(abortTimeout);

        if (!isMounted) return;

        if (res.ok) {
          setServerStatus('ready');
          return; // Stop polling once ready
        } else {
          setServerStatus('waking');
        }
      } catch (err) {
        if (!isMounted) return;
        setServerStatus('waking');
      }

      // Retry after 5s if still mounting and not ready yet
      if (isMounted) {
        timeoutId = window.setTimeout(checkServerHealth, 5000);
      }
    };

    checkServerHealth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (abortController) abortController.abort();
    };
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = () => {
    setIsRedirecting(true);
    login();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome to Git in Bits
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Engineering Intelligence Platform (PoC)
          </p>
        </div>

        <div className="mt-6 bg-surface py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-border">
          {/* Server Readiness Indicator */}
          <div className="mb-6 flex justify-center">
            {serverStatus === 'checking' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border text-xs text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                Connecting to backend...
              </div>
            )}
            {serverStatus === 'ready' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Backend online & ready
              </div>
            )}
            {serverStatus === 'waking' && (
              <div className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 w-full">
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Cloud backend waking up from sleep
                </div>
                <p className="text-[11px] text-text-secondary leading-snug">
                  Render free-tier hibernates after inactivity. You can click <strong>Continue with GitHub</strong> below at any time.
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleLogin}
            className="w-full flex items-center justify-center"
            size="lg"
            isLoading={isRedirecting}
            disabled={isRedirecting}
          >
            <Code className="mr-2 h-5 w-5" />
            {isRedirecting ? 'Connecting to GitHub...' : 'Continue with GitHub'}
          </Button>

          <p className="mt-5 text-xs text-text-secondary">
            By authenticating, you allow Git in Bits to read your organization and repository metadata.
          </p>
        </div>
      </div>
    </div>
  );
}
