import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Code2,
  FileText,
  UserCircle,
  LogOut,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Users as UsersIcon,
  History,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeStore } from '../store/themeStore';
import { useDataStore } from '../store/dataStore';
import { motion } from 'motion/react';

export function AdminLayout() {
  const { user, profile, isAdmin, isLoading, setUser, setLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { settings, fetchSettings, profile: publicProfile, fetchProfileAndSkills } = useDataStore();
  const navigate = useNavigate();
  const location = useLocation();
  const bgImage = settings?.heroBackgroundImageUrl || publicProfile?.coverImageUrl;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMSG, setErrorMSG] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchProfileAndSkills();
    const isLocalAuth = localStorage.getItem('localMockAuth');
    if (isLocalAuth === 'true') {
      const mockProfile = {
        id: 'emergency-admin',
        email: 'admin@jarothea.com',
        role: 'super_admin',
        name: 'Ja_Rothea',
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      setUser({ uid: 'emergency-admin', email: 'admin@jarothea.com' } as any, mockProfile as any);
    } else {
      setUser(null, null);
    }
    setLoading(false);
  }, [setUser, setLoading, fetchSettings, fetchProfileAndSkills]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMSG('');
    setIsSubmitting(true);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (trimmedUsername === 'Ja_Rothea' && trimmedPassword === '@R1213') {
      localStorage.setItem('localMockAuth', 'true');
      const mockProfile = {
        id: 'emergency-admin',
        email: 'admin@jarothea.com',
        role: 'super_admin',
        name: 'Ja_Rothea',
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      setUser({ uid: 'emergency-admin', email: 'admin@jarothea.com' } as any, mockProfile as any);
    } else {
      setErrorMSG('Invalid username or password.');
    }
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('localMockAuth');
    setUser(null, null);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050810]">
        <div className="w-8 h-8 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050810] relative overflow-hidden font-sans">
        {/* Background Aura */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,77,77,0.05)_0%,transparent_70%)] pointer-events-none z-0" />
        
        <div className="relative z-10 max-w-md w-full p-10 bg-zinc-50 dark:bg-white/5 backdrop-blur-3xl rounded-[40px] border border-zinc-200 dark:border-white/5 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#ff4d4d]/5 border border-[#ff4d4d]/10 mb-6 group">
              <UserCircle className="w-10 h-10 text-[#ff4d4d] group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h2 className="text-3xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">System Access</h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-500 text-sm font-medium tracking-tight">Authenticate to access the neural core.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Identifier</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-800 text-sm font-mono"
                  placeholder="USERNAME"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Access Token</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-800 text-sm font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMSG && (
              <div className="p-4 bg-[#ff4d4d]/5 border border-[#ff4d4d]/20 rounded-2xl text-[#ff4d4d] text-xs font-bold uppercase tracking-tighter text-center animate-shake">
                {errorMSG}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-sm font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-[#ff4d4d]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 tracking-[0.2em] uppercase"
            >
              {isSubmitting ? 'Authenticating...' : 'Establish Connection'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Profile', href: '/admin/profile', icon: UserCircle },
    { name: 'Projects', href: '/admin/projects', icon: Briefcase },
    { name: 'Experience', href: '/admin/experience', icon: Briefcase },
    { name: 'Education', href: '/admin/education', icon: GraduationCap },
    { name: 'Skills', href: '/admin/skills', icon: Code2 },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'References', href: '/admin/references', icon: UsersIcon },
    { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { name: 'Activity Logs', href: '/admin/logs', icon: History },
    { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ];

  if (profile?.role === 'super_admin') {
    navigation.push({ name: 'Users', href: '/admin/users', icon: UsersIcon });
  }

  return (
    <div className="h-screen overflow-hidden flex bg-white dark:bg-[#050810] font-sans">
      {/* Background Aura */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(255,77,77,0.02)_0%,transparent_50%)] pointer-events-none z-0" />

      {/* Sidebar */}
      <div className="relative z-10 w-72 bg-zinc-50 dark:bg-black/40 backdrop-blur-3xl border-r border-zinc-200 dark:border-white/5 flex flex-col">
        <div className="h-24 flex items-center justify-between px-8 border-b border-zinc-200 dark:border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-[#ff4d4d] tracking-[0.4em] mb-1 uppercase">Control Center</span>
            <h1 className="text-xl font-display font-bold text-zinc-900 dark:text-white tracking-tight text-nowrap">CHEA ROTHA CMS</h1>
          </div>
        </div>
        
        <nav className="p-6 space-y-2 flex-1 overflow-y-auto scrollbar-hide">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white shadow-[0_0_20px_rgba(255,77,77,0.05)]'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.02] border border-transparent',
                  'group flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300'
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl mr-4 transition-all duration-300",
                  isActive ? "bg-[#ff4d4d]/10 text-[#ff4d4d]" : "bg-zinc-200/50 dark:bg-white/5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="tracking-tight">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ff4d4d] shadow-[0_0_8px_#ff4d4d]" 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-black/20">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white font-bold">
              {profile?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">{profile?.name || 'Admin'}</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate">{profile?.role || 'Superuser'}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center justify-center px-4 py-3 text-xs font-bold tracking-widest uppercase rounded-2xl text-zinc-500 bg-zinc-200/50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:bg-[#ff4d4d]/5 hover:border-[#ff4d4d]/30 hover:text-[#ff4d4d] w-full transition-all duration-300"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Terminate
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-zinc-200 dark:border-white/5 flex items-center justify-end px-10 bg-white/50 dark:bg-black/20">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-[#ff4d4d]/30 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
