import { create } from 'zustand';

interface StatusState {
  backendConnected: boolean;
  checkBackendStatus: () => Promise<void>;
}

export const useStatusStore = create<StatusState>((set) => ({
  backendConnected: false,

  checkBackendStatus: async () => {
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`/api`, {
        signal: controller.signal
      });

      window.clearTimeout(timer);
      set({ backendConnected: res.ok || res.status === 404 });
    } catch (error) {
      set({ backendConnected: false });
    }
  }
}));
