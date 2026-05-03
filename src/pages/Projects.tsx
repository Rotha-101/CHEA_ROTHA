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
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
          {settings?.projectsTitle || 'Selected Works'}
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {settings?.projectsSubtitle || 'A showcase of my work in Data Science, Machine Learning, and Software Development. Focusing on predictive modeling, data pipelines, and actionable insights.'}
        </p>
      </div>

      <motion.div 
        className="grid gap-10 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {projects.map((project) => (
          <motion.div 
            key={project.id} 
            variants={itemVariants}
            className="group flex flex-col bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-500"
          >
            {/* Image Placeholder / Gradient */}
            <div className="h-48 w-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 relative overflow-hidden">
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <span className="font-display text-4xl font-bold text-zinc-900 dark:text-white">{project.title.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium backdrop-blur-md ${project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'}`}>
                  {project.status}
                </span>
              </div>
            </div>

            <div className="flex-1 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                  {project.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-10 flex items-center gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <Github className="h-4 w-4 mr-2" />
                    Source
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
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
