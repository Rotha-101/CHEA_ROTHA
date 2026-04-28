import { Link } from 'react-router-dom';
import { Lock, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export function AdminLayout() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-zinc-50 transition-colors duration-300 dark:bg-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 flex w-full justify-end">
          <button
            onClick={toggleTheme}
            className="rounded-full p-3 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="w-full rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Lock className="h-8 w-8" />
          </div>

          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white">Admin Access Disabled</h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            The admin CMS is temporarily disabled in this public build so private credentials are not exposed in the repository.
          </p>

          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-300"
            >
              Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
