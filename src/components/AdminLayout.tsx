import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Briefcase, GraduationCap, Code2, FileText, UserCircle, LogOut, Sun, Moon, Settings as SettingsIcon, Image as ImageIcon, Users as UsersIcon, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeStore } from '../store/themeStore';
import { motion } from 'motion/react';

export function AdminLayout() {
  const { user, profile, isAdmin, isLoading, setUser, setLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMSG, setErrorMSG] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isLocalAuth = localStorage.getItem('localMockAuth');
    if (isLocalAuth === 'true') {
      const mockProfile = {
        id: 'emergency-admin',
        email: 'admin@jarothea.com',
        role: 'super_admin',
        name: 'Ja_Rothea',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      setUser({ uid: 'emergency-admin', email: 'admin@jarothea.com' } as any, mockProfile as any);
    } else {
      setUser(null, null);
    }
    setLoading(false);
  }, [setUser, setLoading]);

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
        status: 'active'
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Access</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Please sign in with your credentials to access the CMS.</p>
          </div>
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {errorMSG && (
              <div className="space-y-3">
                <div className="text-red-500 text-xs text-center bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-500/20">
                  {errorMSG}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
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
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-zinc-900 shadow-md border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-xl font-bold text-zinc-800 dark:text-white">Portfolio CMS</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300',
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white w-full transition-colors"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
