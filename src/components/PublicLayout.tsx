import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
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

  const navigation = useMemo(() => [
    { name: 'Home', href: '#home', icon: Home, show: true },
    { name: 'About', href: '#about', icon: User, show: settings?.showAbout !== false },
    { name: 'Experience', href: '#experience', icon: Briefcase, show: settings?.showExperience !== false },
    { name: 'Education', href: '#education', icon: GraduationCap, show: settings?.showEducation !== false },
    { name: 'Projects', href: '#projects', icon: Folder, show: settings?.showProjects !== false },
    { name: 'Gallery', href: '#gallery', icon: Image, show: settings?.showGallery !== false },
    { name: 'Skills', href: '#skills', icon: Code2, show: settings?.showSkills !== false },
    { name: 'Blog', href: '#blog', icon: FileText, show: settings?.showBlog !== false },
    { name: 'Reference', href: '#reference', icon: Users, show: settings?.showReferences !== false },
    { name: 'Contact', href: '#contact', icon: MessageSquare, show: settings?.showContact !== false },
  ].filter((nav) => nav.show), [settings]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        // 96px matches the SECTION_SCROLL_OFFSET, and we trigger when the top of the section hits the top 20% of viewport
        rootMargin: '-96px 0px -80% 0px',
        threshold: 0,
      }
    );

    const sections = navigation.map((nav) => nav.href.substring(1));
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
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
    <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans bg-white dark:bg-[#050810] selection:bg-[#ff4d4d]/30 selection:text-white transition-colors duration-500">
      {/* Persistent Technical Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 dark:opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,77,77,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-white/50 dark:bg-[#050810]/50 backdrop-blur-[2px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-[#050810]/40 backdrop-blur-3xl transition-all duration-500">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-8">
          <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="group flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center group-hover:border-[#ff4d4d]/50 transition-all duration-500">
              <span className="text-xl font-display font-black tracking-tighter text-zinc-900 dark:text-white">
                {settings?.siteLogoText?.substring(0, 1) || 'C'}
              </span>
            </div>
            <span className="text-2xl font-display font-bold tracking-tighter text-zinc-900 dark:text-white group-hover:text-[#ff4d4d] transition-colors">
              {settings?.siteLogoText || 'CR.'}
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={cn(
                  'relative rounded-full px-5 py-2 text-[11px] font-mono font-bold uppercase tracking-widest transition-all duration-300 z-0',
                  activeSection === item.href.substring(1)
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                )}
              >
                {activeSection === item.href.substring(1) && (
                  <motion.div
                    layoutId="activeTabIndicatorDesktop"
                    className="absolute inset-0 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#ff4d4d] shadow-[0_0_10px_#ff4d4d]" />
                  </motion.div>
                )}
                {item.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => toggleTheme()}
                className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <a
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-white/10 px-4 py-1.5 text-sm font-medium text-zinc-600 dark:text-white transition-all hover:border-[#ff4d4d] hover:bg-[#ff4d4d]/10 hover:text-[#ff4d4d]"
                title="Admin Login"
              >
                <Shield className="h-3.5 w-3.5" />
                {adminLabel}
              </a>
            </div>

            <button
              onClick={() => toggleTheme()}
              className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white md:hidden"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white md:hidden"
              aria-label="Toggle mobile menu"
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
          className="fixed inset-x-0 top-20 z-40 border-b border-zinc-200 dark:border-white/5 bg-white/90 dark:bg-black/80 backdrop-blur-2xl md:hidden"
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
                  'relative flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors duration-200 z-0',
                  activeSection === item.href.substring(1)
                    ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/5'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                )}
              >
                {activeSection === item.href.substring(1) && (
                  <motion.div
                    layoutId="activeTabIndicatorMobile"
                    className="absolute inset-y-2 left-0 w-1 bg-[#ff4d4d] shadow-[0_0_8px_#ff4d4d] rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10">{item.name}</span>
              </a>
            ))}

            <div className="flex gap-4 border-t border-zinc-200 dark:border-white/5 px-4 pt-4">
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-zinc-500 transition-colors hover:text-[#ff4d4d]"
                title="Admin Login"
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">{adminLabel}</span>
              </a>
            </div>
          </div>
        </nav>
      )}

      <aside className="hidden" />

      {settings?.maintenanceMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-[#050810] p-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="flex justify-center">
              <div className="rounded-3xl border border-[#ff4d4d]/20 bg-[#ff4d4d]/5 p-6 animate-pulse">
                <Globe className="h-16 w-16 text-[#ff4d4d]" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">System Updating</h1>
              <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                We&apos;re currently performing scheduled maintenance. We&apos;ll be back online shortly.
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-8">
              <div className="h-1 w-8 rounded-full bg-[#ff4d4d] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1 w-8 rounded-full bg-[#ff4d4d] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1 w-8 rounded-full bg-[#ff4d4d] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 w-full flex-grow">
        <Outlet />


      </main>
    </div>
  );
}
