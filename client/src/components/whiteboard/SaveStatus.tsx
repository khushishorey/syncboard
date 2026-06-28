import { useEffect, useState } from 'react';

type Status = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  status: Status;
  savedAt: string | null;
}

const SaveStatus = ({ status, savedAt }: Props) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (status === 'saved') {
      setShow(true);
      // Fade out after 3 seconds
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
    if (status === 'saving' || status === 'error') {
      setShow(true);
    }
  }, [status]);

  if (!show && status === 'idle') return null;

  const formatSavedAt = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
      style={{
        opacity: show ? 1 : 0,
        backgroundColor:
          status === 'saving' ? '#1e293b' :
          status === 'saved'  ? '#14532d' :
          status === 'error'  ? '#450a0a' : '#1e293b',
        border: `1px solid ${
          status === 'saving' ? '#334155' :
          status === 'saved'  ? '#166534' :
          status === 'error'  ? '#991b1b' : '#334155'
        }`,
        color:
          status === 'saving' ? '#94a3b8' :
          status === 'saved'  ? '#4ade80' :
          status === 'error'  ? '#f87171' : '#94a3b8',
      }}
    >
      {status === 'saving' && (
        <>
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
          Saving...
        </>
      )}
      {status === 'saved' && (
        <>
          <span>✓</span>
          Saved {savedAt ? `at ${formatSavedAt(savedAt)}` : ''}
        </>
      )}
      {status === 'error' && (
        <>
          <span>✕</span>
          Save failed — will retry
        </>
      )}
    </div>
  );
};

export default SaveStatus;

export type { Status };