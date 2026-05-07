import { useEffect } from 'react';
import { Github, Linkedin, Mail, MapPin, Phone, ArrowRight, User, Twitter, Instagram, Facebook, MessageSquare, AtSign } from 'lucide-react';
import { useDataStore } from '../store/dataStore';

// Import other sections
import About from './About';
import Experience from './Experience';
import Education from './Education';
import Projects from './Projects';
import Gallery from './Gallery';
import Skills from './Skills';
import Blog from './Blog';
import Reference from './Reference';
import Contact from './Contact';
import SectionReveal from '../components/SectionReveal';
import { motion } from 'motion/react';

export default function Home() {
  const { profile, profileLoaded, fetchProfileAndSkills, settings, fetchSettings } = useDataStore();

  useEffect(() => {
    fetchProfileAndSkills();
    fetchSettings();
  }, [fetchProfileAndSkills, fetchSettings]);

  if (!profileLoaded) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return <div className="min-h-screen flex items-center justify-center font-mono text-zinc-500">Profile not found.</div>;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-32 pb-40">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-start">

            {/* Left Column - Profile Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 order-2 lg:order-1 flex justify-center lg:justify-start"
            >
              <div className="relative group">
                {/* Visual Orbs */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#ff4d4d]/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative w-full max-w-xs lg:max-w-lg aspect-[4/5] rounded-[40px] overflow-hidden border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
                  {profile.profilePhotoUrl ? (
                    <img src={profile.profilePhotoUrl} alt={profile.name} className="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-700">
                      <User className="h-20 w-20 mb-4 opacity-20" />
                      <p className="font-mono text-[10px] uppercase tracking-widest">Null_Visual</p>
                    </div>
                  )}
                  {/* Decorative corner */}
                  <div className="absolute top-6 right-6 w-3 h-3 border-t-2 border-r-2 border-[#ff4d4d]/40" />
                  <div className="absolute bottom-6 left-6 w-3 h-3 border-b-2 border-l-2 border-[#ff4d4d]/40" />
                </div>
              </div>
            </motion.div>

            {/* Right Column - Content */}
            <div className="lg:col-span-7 order-1 lg:order-2 relative">
              <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-[#ff4d4d] mb-6 tracking-[0.4em] uppercase">
                <span className="w-12 h-px bg-[#ff4d4d]/40" />
                Core_Identifier
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-7xl lg:text-9xl font-display font-black tracking-tighter text-zinc-950 dark:text-white leading-[0.95] uppercase"
              >
                {profile.name?.split(' ')[0] || 'Node'}
                <br />
                <span className="text-zinc-100 dark:text-zinc-800 outline-text">{profile.name?.split(' ')[1] || 'Initialized'}</span>
              </motion.h1>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-5 sm:mt-8 text-base sm:text-2xl font-mono font-bold text-[#ff4d4d] tracking-widest uppercase flex items-center gap-4"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d] animate-pulse" />
                {profile.title}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-6 sm:mt-8 text-sm sm:text-lg text-zinc-600 dark:text-zinc-500 leading-relaxed max-w-2xl font-medium"
              >
                {profile.bio}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-6"
              >
                <a href="#projects" className="group relative overflow-hidden px-5 py-2.5 sm:px-8 sm:py-4 bg-[#ff4d4d] text-white text-[9px] sm:text-[10px] font-mono font-black tracking-[0.2em] uppercase rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,77,77,0.3)]">
                  <span className="relative z-10 flex items-center gap-3">
                    Initialize Projects
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </a>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white/10 transition-all" title="GitHub">
                      <Github className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white/10 transition-all" title="LinkedIn">
                      <Linkedin className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white/10 transition-all" title="X / Twitter">
                      <Twitter className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={profile.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white/10 transition-all" title="Instagram">
                      <Instagram className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </a>
                  )}
                  {profile.facebook && (
                    <a href={profile.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white/10 transition-all" title="Facebook">
                      <Facebook className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </a>
                  )}
                  {profile.discord && (
                    <a href={`https://discord.com/users/${profile.discord}`} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white/10 transition-all" title="Discord">
                      <MessageSquare className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </a>
                  )}
                  {profile.threads && (
                    <a href={profile.threads} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white/10 transition-all" title="Threads">
                      <AtSign className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

      </section>

      {/* Other Sections */}
      {settings?.showAbout !== false && <SectionReveal><section id="about"><About /></section></SectionReveal>}
      {settings?.showExperience !== false && <SectionReveal><section id="experience"><Experience /></section></SectionReveal>}
      {settings?.showEducation !== false && <SectionReveal><section id="education"><Education /></section></SectionReveal>}
      {settings?.showProjects !== false && <SectionReveal><section id="projects"><Projects /></section></SectionReveal>}
      {settings?.showGallery !== false && <SectionReveal><section id="gallery"><Gallery /></section></SectionReveal>}
      {settings?.showSkills !== false && <SectionReveal><section id="skills"><Skills /></section></SectionReveal>}
      {settings?.showBlog !== false && <SectionReveal><section id="blog"><Blog /></section></SectionReveal>}
      {settings?.showReferences !== false && <SectionReveal><section id="reference"><Reference /></section></SectionReveal>}
      {settings?.showContact !== false && <SectionReveal><section id="contact"><Contact /></section></SectionReveal>}
    </div>
  );
}
