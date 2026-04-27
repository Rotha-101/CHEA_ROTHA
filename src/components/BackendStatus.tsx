import { useEffect } from 'react';
import { useStatusStore } from '../store/statusStore';
import { AlertCircle, Check } from 'lucide-react';

export function BackendStatus() {
  const { backendConnected, checkBackendStatus } = useStatusStore();

  useEffect(() => {
    // Check on mount
    checkBackendStatus();

    // Check every 5 seconds
    const interval = setInterval(checkBackendStatus, 5000);
    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  if (backendConnected) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-green-900 text-green-100 px-3 py-2 rounded-lg text-sm">
        <Check size={16} />
        Backend Connected
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-red-900 text-red-100 px-3 py-2 rounded-lg text-sm animate-pulse">
      <AlertCircle size={16} />
      Backend Offline
    </div>
  );
}
