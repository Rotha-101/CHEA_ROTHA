import { Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Github, Linkedin, Mail, Sun, Moon, Home, User, Briefcase, Folder, GraduationCap, Code2, Image, MessageSquare, Shield, FileText, Globe, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useThemeStore } from '../store/themeStore';
import { useDataStore } from '../store/dataStore';
import { analyticsService } from '../lib/analytics';
import React, { useEffect, useState } from 'react';

export function PublicLayout() {
  const { theme, toggleTheme } = useThemeStore();
  const { settings, fetchSettings, profile, fetchProfileAndSkills } = useDataStore();
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch settings and profile on mount so background URL is available
  useEffect(() => {
    fetchSettings();
    fetchProfileAndSkills();
  }, [fetchSettings, fetchProfileAndSkills]);

  const navigation = [
    { name: 'Home',       href: '#home',       icon: Home,         show: true },
    { name: 'About',      href: '#about',      icon: User,         show: settings?.showAbout      !== false },
    { name: 'Experience', href: '#experience', icon: Briefcase,    show: settings?.showExperience !== false },
    { name: 'Education', href: '#education', icon: GraduationCap, show: settings?.showExperience !== false },
    { name: 'Projects',   href: '#projects',   icon: Folder,      show: settings?.showProjects   !== false },
    { name: 'Gallery',    href: '#gallery',    icon: Image,        show: settings?.showGallery    !== false },
    { name: 'Skills',     href: '#skills',     icon: Code2,        show: settings?.showSkills     !== false },
    { name: 'Blog',       href: '#blog',       icon: FileText,     show: settings?.showBlog       !== false },
    { name: 'Reference',  href: '#reference',  icon: Users,        show: settings?.showReferences !== false },
    { name: 'Contact',    href: '#contact',    icon: MessageSquare,show: settings?.showContact    !== false },
  ].filter(nav => nav.show);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigation.map(nav => nav.href.substring(1));
      let current = '';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 200) {
          current = section;
        }
      }
      if (current) setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigation]);

  useEffect(() => {
    analyticsService.trackVisit();
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
      setActiveSection(targetId);
    }
  };

  // Use settings bg URL first, then fall back to the Cover Image uploaded in profile
  const bgImage = settings?.heroBackgroundImageUrl || profile?.coverImageUrl;

  return (
    <div className="min-h-screen font-sans flex relative overflow-x-hidden transition-colors duration-500">

      {/* ── FULL-SCREEN BACKGROUND (sits behind everything) ── */}
      {bgImage && (
        <div
          aria-hidden
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ backgroundImage: `url("${bgImage}")` }}
        />
      )}

      {/* Light-mode tint overlay  – heavy in light mode for readability */}
      <div
        aria-hidden
        className={cn(
          'fixed inset-0 z-0 pointer-events-none transition-colors duration-500',
          bgImage
            ? 'bg-white/85 dark:bg-zinc-950/80'   // tinted overlay when image exists
            : 'bg-white dark:bg-zinc-950'           // solid when no image
        )}
      />

      {/* Toggle sidebar button when closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-50 rounded-full ui bg-amber-400/90 text-zinc-950 p-3 shadow-2xl hover:bg-amber-500 transition-colors"
          aria-label="Open navigation"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* ── SIDEBAR ── */}
      <aside className={cn(
        'fixed top-0 left-0 h-screen z-50 flex flex-col bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl saturate-150 border-r border-zinc-200/60 dark:border-zinc-800/60 transition-all duration-300',
        sidebarOpen ? 'translate-x-0 w-20 lg:w-64' : '-translate-x-full w-64'
      )}>

        {/* Logo row */}
        <div className="h-20 flex items-center justify-between lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <a href="#home" onClick={e => scrollToSection(e, '#home')} className="flex items-center group">
            <span className="text-2xl font-display font-bold tracking-tighter text-zinc-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
              CR.
            </span>
          </a>
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-3">
              <a href="https://github.com/Rotha-101" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" title="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/chea-rotha-44268b2a5/" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="mailto:chearotha.itc.edu@gmail.com" className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Email">
                <Mail className="h-4 w-4" />
              </a>
              <button
                onClick={() => setSidebarOpen(false)}
                className="ui p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close navigation"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="lg:hidden">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ui p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close navigation"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-8 flex flex-col gap-1 px-4 overflow-y-auto">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={e => scrollToSection(e, item.href)}
              title={item.name}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                activeSection === item.href.substring(1)
                  ? 'bg-amber-400/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                activeSection === item.href.substring(1) ? 'text-amber-500' : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300'
              )} />
              <span className="hidden lg:block font-medium text-sm tracking-wide">{item.name}</span>
              {activeSection === item.href.substring(1) && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-2 items-center lg:items-start">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl w-full flex items-center justify-center lg:justify-start gap-4 text-zinc-500 hover:text-amber-500 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-amber-400 dark:hover:bg-zinc-800/60 transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="hidden lg:block text-sm font-medium">Toggle Theme</span>
          </button>

          <a
            href="/admin"
            className="p-3 rounded-xl w-full flex items-center justify-center lg:justify-start gap-4 text-zinc-500 hover:text-amber-500 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-amber-400 dark:hover:bg-zinc-800/60 transition-all duration-300"
            title="Admin Access"
          >
            <Shield className="h-5 w-5" />
            <span className="hidden lg:block text-sm font-medium">Admin Access</span>
          </a>
        </div>
      </aside>

      {/* ── MAINTENANCE OVERLAY ── */}
      {settings?.maintenanceMode && (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="flex justify-center">
              <div className="p-6 bg-amber-400/10 rounded-3xl border border-amber-400/20 animate-pulse">
                <Globe className="w-16 h-16 text-amber-400" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-display font-bold text-white tracking-tight">System Updating</h1>
              <p className="text-zinc-400 leading-relaxed">We're currently performing scheduled maintenance. We'll be back online very shortly.</p>
            </div>
            <div className="pt-8 flex justify-center gap-4">
              <div className="h-1 w-8 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1 w-8 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1 w-8 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className={cn(
        'relative z-10 flex-grow transition-all duration-300',
        sidebarOpen ? 'ml-20 lg:ml-64 w-[calc(100%-5rem)] lg:w-[calc(100%-16rem)]' : 'ml-0 w-full'
      )}>
        <Outlet />

        <footer className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-200/50 dark:border-zinc-800/50 mt-24 transition-colors duration-500">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
              &copy; {new Date().getFullYear()} {settings?.footerText || 'Chea Rotha. All rights reserved.'}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
