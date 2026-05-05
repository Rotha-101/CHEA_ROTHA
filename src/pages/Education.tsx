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
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 dark:text-white">
            {edu.degree} in {edu.field}
          </h3>
          <p className="mt-1 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 font-medium">{edu.institution}</p>
        </div>
        <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400 bg-white/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1 w-fit">
          {edu.startDate} - {edu.endDate || 'Present'}
        </div>
      </div>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line text-[13px] sm:text-sm md:text-base">
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
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white">
          {settings?.educationTitle || 'Education'}
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
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
