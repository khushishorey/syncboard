import { useEffect, useState } from 'react';

const ServerWakeUp = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<'checking' | 'awake' | 'waking'>('checking');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let mounted = true;
    const MAX_ATTEMPTS = 10;
    const RETRY_DELAY = 3000;

    const ping = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/health`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (res.ok && mounted) {
          setStatus('awake');
        }
      } catch {
        if (!mounted) return;
        setAttempts((a) => {
          const next = a + 1;
          if (next >= MAX_ATTEMPTS) return next;
          setStatus('waking');
          setTimeout(ping, RETRY_DELAY);
          return next;
        });
      }
    };

    ping();
    return () => { mounted = false; };
  }, []);

  if (status === 'awake') return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-white font-semibold text-lg mb-2">
          {status === 'checking' ? 'Connecting...' : 'Waking up server...'}
        </h2>
        <p className="text-slate-400 text-sm max-w-xs">
          {status === 'waking'
            ? 'The server is starting up. This takes about 30 seconds on first load.'
            : 'Checking server status...'}
        </p>
        {attempts > 2 && (
          <p className="text-slate-500 text-xs mt-3">
            Attempt {attempts} of 10 — please wait
          </p>
        )}
      </div>
    </div>
  );
};

export default ServerWakeUp;