import { create } from 'zustand';

// Local user type — no Firebase dependency
export interface LocalUser {
  uid: string;
  email: string;
}

export interface UserProfile {
  id: string;
  uid?: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  name: string;
  displayName?: string;
  createdAt: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

interface AuthState {
  user: LocalUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  setUser: (user: LocalUser | null, profile?: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  setUser: (user, profile = null) => {
    const isAdmin = !!profile && (profile.role === 'super_admin' || profile.role === 'admin');
    set({ user, profile, isAdmin });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
