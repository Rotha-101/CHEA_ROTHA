import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Briefcase,
  Code2,
  FileText,
  Folder,
  Github,
  Globe,
  GraduationCap,
  Home,
  Image,
  Linkedin,
  Mail,
  Menu,
  MessageSquare,
  Moon,
  Shield,
  Sun,
  User,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { analyticsService } from '../lib/analytics';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { useThemeStore } from '../store/themeStore';

const HEADER_HEIGHT = 80;
const SECTION_SCROLL_OFFSET = 96;

export function PublicLayout() {
  const { theme, toggleTheme } = useThemeStore();
  const { isAdmin } = useAuthStore();
  const { settings, fetchSettings, profile, fetchProfileAndSkills } = useDataStore();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchProfileAndSkills();
  }, [fetchSettings, fetchProfileAndSkills]);

  const navigation = [
    { name: 'Home', href: '#home', icon: Home, show: true },
    { name: 'About', href: '#about', icon: User, show: settings?.showAbout !== false },
    { name: 'Experience', href: '#experience', icon: Briefcase, show: settings?.showExperience !== false },
    { name: 'Education', href: '#education', icon: GraduationCap, show: settings?.showExperience !== false },
    { name: 'Projects', href: '#projects', icon: Folder, show: settings?.showProjects !== false },
    { name: 'Gallery', href: '#gallery', icon: Image, show: settings?.showGallery !== false },
    { name: 'Skills', href: '#skills', icon: Code2, show: settings?.showSkills !== false },
    { name: 'Blog', href: '#blog', icon: FileText, show: settings?.showBlog !== false },
    { name: 'Reference', href: '#reference', icon: Users, show: settings?.showReferences !== false },
    { name: 'Contact', href: '#contact', icon: MessageSquare, show: settings?.showContact !== false },
  ].filter((nav) => nav.show);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigation.map((nav) => nav.href.substring(1));
      const scrollPosition = window.scrollY + SECTION_SCROLL_OFFSET;
      let currentSection = sections[0] || 'home';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && scrollPosition >= element.offsetTop) {
          currentSection = section;
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigation]);

  useEffect(() => {
    analyticsService.trackVisit();
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    setActiveSection(targetId);
  };

  const bgImage = settings?.heroBackgroundImageUrl || profile?.coverImageUrl;
  const adminLabel = isAdmin ? 'Dashboard' : 'Login';

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans transition-colors duration-500">
      {bgImage && (
        <div
          aria-hidden
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ backgroundImage: `url("${bgImage}")` }}
        />
      )}

      <div
        aria-hidden
        className={cn(
          'fixed inset-0 z-0 pointer-events-none transition-colors duration-500',
          bgImage ? 'bg-white/85 dark:bg-zinc-950/80' : 'bg-white dark:bg-zinc-950'
        )}
      />

      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-zinc-200/60 bg-white/78 backdrop-blur-xl saturate-150 transition-colors duration-500 dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="group flex items-center">
            <span className="font-display text-2xl font-bold tracking-tighter text-zinc-900 transition-colors group-hover:text-amber-500 dark:text-white dark:group-hover:text-amber-400">
              CR.
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  activeSection === item.href.substring(1)
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white'
                )}
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <a
                href="https://github.com/Rotha-101"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                title="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/chea-rotha-44268b2a5/"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:chearotha.itc.edu@gmail.com"
                className="text-zinc-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                title="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => toggleTheme()}
                className="ui rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <a
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300/80 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-amber-400 dark:hover:text-amber-400"
                title="Admin Login"
              >
                <Shield className="h-4 w-4" />
                {adminLabel}
              </a>
            </div>

            <button
              onClick={() => toggleTheme()}
              className="ui rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:hidden"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:hidden"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div aria-hidden style={{ height: HEADER_HEIGHT }} />

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          className="fixed inset-x-0 top-20 z-40 border-b border-zinc-200/60 bg-white/92 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/92 md:hidden"
        >
          <div className="mx-auto flex max-h-[calc(100vh-5rem)] max-w-7xl flex-col gap-1 overflow-y-auto p-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  scrollToSection(e, item.href);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200',
                  activeSection === item.href.substring(1)
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </a>
            ))}

            <div className="flex gap-4 border-t border-zinc-200/60 px-4 pt-4 dark:border-zinc-800/60">
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-zinc-500 transition-colors hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400"
                title="Admin Login"
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">{adminLabel}</span>
              </a>
            </div>

            <div className="flex gap-4 border-t border-zinc-200/60 px-4 pt-4 dark:border-zinc-800/60">
              <a
                href="https://github.com/Rotha-101"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/chea-rotha-44268b2a5/"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:chearotha.itc.edu@gmail.com"
                className="text-zinc-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                title="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </nav>
      )}

      <aside className="hidden" />

      {settings?.maintenanceMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 p-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="flex justify-center">
              <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-6 animate-pulse">
                <Globe className="h-16 w-16 text-amber-400" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-bold tracking-tight text-white">System Updating</h1>
              <p className="leading-relaxed text-zinc-400">
                We&apos;re currently performing scheduled maintenance. We&apos;ll be back online very shortly.
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-8">
              <div className="h-1 w-8 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1 w-8 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1 w-8 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 w-full flex-grow">
        <Outlet />

        <footer className="mt-24 border-t border-zinc-200/50 bg-white/50 backdrop-blur-sm transition-colors duration-500 dark:border-zinc-800/50 dark:bg-zinc-900/50">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-12 sm:flex-row sm:px-6 lg:px-8">
            <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
              &copy; {new Date().getFullYear()} {settings?.footerText || 'Chea Rotha. All rights reserved.'}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
