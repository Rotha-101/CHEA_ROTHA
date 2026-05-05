import React, { useEffect } from 'react';
import { Github, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useDataStore } from '../store/dataStore';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  status: string;
  demoUrl: string;
  githubUrl: string;
  priority: number;
}

export default function Projects() {
  const { projects, projectsLoaded, fetchProjects, settings } = useDataStore();
 
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
 
  if (!projectsLoaded) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
 
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
 
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" as any } }
  };
 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mb-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-4">
          <span className="text-[#ff4d4d] font-mono opacity-80">⟩</span>
          {settings?.projectsTitle || 'Selected Works'}
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          {settings?.projectsSubtitle || 'A showcase of my work in Data Science, Machine Learning, and Software Development.'}
        </p>
      </div>

      <motion.div 
        className="grid gap-8 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {projects.map((project) => (
          <motion.div 
            key={project.id} 
            variants={itemVariants}
            className="group flex flex-col bg-zinc-50 dark:bg-white/5 rounded-[32px] border border-zinc-200 dark:border-white/5 overflow-hidden hover:border-[#ff4d4d]/30 hover:bg-zinc-100 dark:hover:bg-white/[0.07] transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,77,77,0.08)]"
          >
            {/* Image Section */}
            <div className="h-64 w-full bg-zinc-100 dark:bg-white/5 relative overflow-hidden">
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <span className="font-display text-4xl font-bold text-zinc-900 dark:text-white">{project.title.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div className="absolute top-6 right-6">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-xl ${project.status === 'Completed' ? 'bg-[#ff4d4d]/20 text-[#ff4d4d] border border-[#ff4d4d]/30' : 'bg-white/10 text-white border border-white/20'}`}>
                  {project.status}
                </span>
              </div>
            </div>

            <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-white group-hover:text-[#ff4d4d] transition-colors">
                  {project.title}
                </h3>
                <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
                  {project.description}
                </p>
                <div className="mt-10 flex flex-wrap gap-2.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-mono font-semibold bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/5 group-hover:border-[#ff4d4d]/20 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-12 flex items-center gap-8 pt-8 border-t border-zinc-200 dark:border-white/5">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <Github className="h-4 w-4 mr-2" />
                    Source
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm font-bold text-[#ff4d4d] hover:text-[#ff3333] transition-colors">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
