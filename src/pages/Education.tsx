import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useDataStore } from '../store/dataStore';

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  priority: number;
  photos?: string[];
}

function EducationCard({ edu }: { edu: EducationItem }) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="group rounded-3xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 p-6 sm:p-8 hover:border-[#ff4d4d]/30 hover:bg-zinc-100 dark:hover:bg-white/[0.07] transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,77,77,0.05)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 dark:text-white group-hover:text-[#ff4d4d] transition-colors">
            {edu.degree} in {edu.field}
          </h3>
          <p className="mt-1.5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-medium">{edu.institution}</p>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-white/10 rounded-full px-4 py-1.5 w-fit">
          {edu.startDate} - {edu.endDate || 'Present'}
        </div>
      </div>
      <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line text-sm sm:text-base">
        {edu.description}
      </p>
    </motion.article>
  );
}

export default function Education() {
  const {
    education,
    experienceLoaded,
    fetchExperienceAndEducation,
    settings,
  } = useDataStore();
  
  useEffect(() => {
    fetchExperienceAndEducation();
  }, [fetchExperienceAndEducation]);
  
  if (!experienceLoaded) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <section className="w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-4">
          <span className="text-[#ff4d4d] font-mono opacity-80">⟩</span>
          {settings?.educationTitle || 'Education'}
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm sm:text-base max-w-2xl">
          {settings?.educationSubtitle || 'Academic background and qualifications.'}
        </p>
        <div className="mt-8 space-y-5">
          {education.map((edu: EducationItem) => (
            <EducationCard key={edu.id} edu={edu} />
          ))}
        </div>
      </section>
    </div>
  );
}
