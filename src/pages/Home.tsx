import { useEffect } from 'react';
import { Github, Linkedin, Mail, MapPin, Phone, ArrowRight, User, Code2, Database, BrainCircuit, LineChart, MessageSquare, Terminal, Layout, Server, Cpu, Globe, Wrench } from 'lucide-react';
import { useDataStore } from '../store/dataStore';

// Import other sections
import About from './About';
import Experience from './Experience';
import Projects from './Projects';
import Gallery from './Gallery';
import Skills from './Skills';
import Blog from './Blog';
import Reference from './Reference';
import Contact from './Contact';

interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

export default function Home() {
  const { profile, skills, profileLoaded, fetchProfileAndSkills, settings, fetchSettings } = useDataStore();

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

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Animation variants removed for clean static aesthetic

  return (
    <div className="w-full">
      {/* Hero Section - transparent so global background shows through */}
      <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-16 md:pt-0">
            
            {/* Left Column - Profile Photo */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-800/50">
                {profile.profilePhotoUrl ? (
                  <img src={profile.profilePhotoUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                    <User className="h-24 w-24 mb-4 opacity-40" />
                    <p className="font-mono text-sm">Upload Profile Photo</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Content with readable card */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
              <div className="bg-white/70 dark:bg-transparent backdrop-blur-sm dark:backdrop-blur-none rounded-3xl p-8 lg:p-0 lg:bg-transparent lg:dark:bg-transparent transition-all duration-500">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter text-zinc-900 dark:text-white leading-[1.05]">
                {profile.name || 'Setup Profile'}
              </h1>
              
              <h2 className="mt-5 text-xl md:text-2xl lg:text-3xl font-display font-medium text-amber-600 dark:text-amber-400 tracking-tight">
                {profile.title || 'Add your title in the Admin Panel'}
              </h2>
              
              <p className="mt-6 text-base md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
                {profile.bio || 'Your biography will appear here once you set up your profile.'}
              </p>
              
              <div className="mt-10 flex flex-wrap items-center gap-6">
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
              </div>

              <div className="mt-14 pt-8 border-t border-zinc-300/50 dark:border-zinc-800/50 flex flex-col sm:flex-row gap-6 font-mono text-sm text-zinc-600 dark:text-zinc-400">
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
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {settings?.showAbout !== false && (
        <div id="about">
          <About />
        </div>
      )}

      {/* Experience Section */}
      {settings?.showExperience !== false && (
        <div id="experience">
          <Experience />
        </div>
      )}

      {/* Projects Section */}
      {settings?.showProjects !== false && (
        <div id="projects">
          <Projects />
        </div>
      )}

      {/* Gallery Section */}
      {settings?.showGallery !== false && (
        <div id="gallery">
          <Gallery />
        </div>
      )}

      {/* Skills Section */}
      {settings?.showSkills !== false && (
        <div id="skills">
          <Skills />
        </div>
      )}

      {/* Blog Section */}
      {settings?.showBlog !== false && (
        <div id="blog">
          <Blog />
        </div>
      )}

      {/* Reference Section */}
      {settings?.showReferences !== false && (
        <div id="reference">
          <Reference />
        </div>
      )}

      {/* Contact Section */}
      {settings?.showContact !== false && (
        <div id="contact">
          <Contact />
        </div>
      )}
    </div>
  );
}
