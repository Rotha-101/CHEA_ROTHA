import { useEffect } from 'react';
import { Github, Linkedin, Mail, MapPin, Phone, ArrowRight, User } from 'lucide-react';
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
      <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-16 md:pt-0">

            {/* Left Column - Profile Photo (Box) */}
            <motion.div 
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 order-2 lg:order-1 flex justify-center lg:justify-start"
            >
              <div className="relative w-full max-w-[17rem] sm:max-w-xs md:max-w-sm lg:max-w-[22rem] xl:max-w-[24rem] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-800/50">
                {profile.profilePhotoUrl ? (
                  <img src={profile.profilePhotoUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                    <User className="h-24 w-24 mb-4 opacity-40" />
                    <p className="font-mono text-sm">Upload Profile Photo</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Content */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
              <div className="bg-white/70 dark:bg-transparent backdrop-blur-sm dark:backdrop-blur-none rounded-3xl p-8 lg:p-0 lg:bg-transparent lg:dark:bg-transparent transition-all duration-500">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter text-zinc-900 dark:text-white leading-[1.1]"
                >
                  {profile.name || 'Setup Profile'}
                </motion.h1>

                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-medium text-amber-600 dark:text-amber-400 tracking-tight"
                >
                  {profile.title || 'Add your title in the Admin Panel'}
                </motion.h2>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-6 text-sm sm:text-base md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl"
                >
                  {profile.bio || 'Your biography will appear here once you set up your profile.'}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-10 flex flex-wrap items-center gap-6"
                >
                  <a href="#projects" className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20">
                    View Projects
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>

                  <div className="flex items-center gap-6 ml-2">
                    {profile.cvUrl && (
                      <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="text-zinc-700 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 transition-colors font-medium text-sm border-b border-transparent hover:border-amber-400 pb-0.5">
                        Download CV
                      </a>
                    )}
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                        <span className="sr-only">GitHub</span>
                        <Github className="h-6 w-6" />
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">
                        <span className="sr-only">LinkedIn</span>
                        <Linkedin className="h-6 w-6" />
                      </a>
                    )}
                    {profile.email && (
                      <a href={`mailto:${profile.email}`} className="text-zinc-600 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors">
                        <span className="sr-only">Email</span>
                        <Mail className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="mt-10 flex flex-col sm:flex-row gap-6 font-mono text-sm text-zinc-600 dark:text-zinc-400"
                >
                  {profile.location && (
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-zinc-500/80" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-zinc-500/80" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </motion.div>
              </div>
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
