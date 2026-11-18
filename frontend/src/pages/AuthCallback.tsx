import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDataSource } from '../context/DataSourceContext';
import { Spinner } from '../components/ui/Spinner';

export function AuthCallback() {
  const { checkAuth } = useAuth();
  const { sourceType } = useDataSource();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const authenticate = async () => {
      const token = searchParams.get('token');
      if (token) {
        localStorage.setItem('gib_auth_token', token);
        // Clear token from browser URL bar immediately for cleaner UX & security
        window.history.replaceState({}, '', window.location.pathname);
      }

      const user = await checkAuth();
      if (user) {
        if (sourceType) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/data-source-selection', { replace: true });
        }
      } else {
        localStorage.removeItem('gib_auth_token');
        navigate('/login', { replace: true });
      }
    };

    authenticate();
  }, [checkAuth, navigate, sourceType, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-text-primary space-y-4">
      <Spinner className="h-10 w-10" />
      <p className="text-lg font-medium text-text-secondary">Authenticating with GitHub...</p>
    </div>
  );
}
