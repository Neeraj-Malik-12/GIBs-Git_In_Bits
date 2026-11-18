import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Code, CheckCircle2, Clock } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';

type ServerStatus = 'checking' | 'ready' | 'waking';

export function Login() {
  const { user, login } = useAuth();
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const pollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkServerHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (!isMounted) return;

        if (res.ok) {
          setServerStatus('ready');
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
        } else {
          setServerStatus('waking');
        }
      } catch (err) {
        if (!isMounted) return;
        setServerStatus('waking');
      }
    };

    // Immediate check
    checkServerHealth();

    // Poll every 4 seconds until ready
    pollTimerRef.current = window.setInterval(checkServerHealth, 4000);

    return () => {
      isMounted = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const isWaking = serverStatus === 'waking';

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
                  <Clock className="h-4 w-4 animate-spin" />
                  Waking up cloud server...
                </div>
                <p className="text-[11px] text-text-secondary leading-snug">
                  Render free-tier hibernates after inactivity. It will be ready in ~30-60s.
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={login}
            className="w-full flex items-center justify-center"
            size="lg"
            isLoading={isWaking}
            disabled={isWaking}
          >
            <Code className="mr-2 h-5 w-5" />
            {isWaking ? 'Waiting for server...' : 'Continue with GitHub'}
          </Button>

          {isWaking && (
            <button
              type="button"
              onClick={login}
              className="mt-3 text-xs text-text-secondary hover:text-text-primary underline cursor-pointer"
            >
              Continue anyway (if already awake)
            </button>
          )}

          <p className="mt-5 text-xs text-text-secondary">
            By authenticating, you allow Git in Bits to read your organization and repository metadata.
          </p>
        </div>
      </div>
    </div>
  );
}
