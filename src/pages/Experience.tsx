import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDataStore } from '../store/dataStore';

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  priority: number;
  photos?: string[];
}

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

function PhotoPreviewLoop({ photos }: { photos?: string[] }) {
  const list = photos || [];
  const [startIndex, setStartIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const visibleCount = Math.min(4, list.length);
  const shouldLoop = list.length > 4;

  useEffect(() => {
    if (!shouldLoop) return;
    const timer = window.setInterval(() => {
      setStartIndex((prev) => (prev + 1) % list.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [shouldLoop, list.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowLeft') {
        setLightbox((prev) => (prev === null ? prev : (prev - 1 + list.length) % list.length));
      }
      if (event.key === 'ArrowRight') {
        setLightbox((prev) => (prev === null ? prev : (prev + 1) % list.length));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox, list.length]);

  if (list.length === 0) return null;

  const visiblePhotos = Array.from({ length: visibleCount }, (_unused, offset) => {
    const idx = (startIndex + offset) % list.length;
    return { idx, url: list[idx] };
  });

  return (
    <>
      <div className="mt-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {visiblePhotos.map(({ idx, url }) => (
            <button
              key={`${url}-${idx}-${startIndex}`}
              onClick={() => setLightbox(idx)}
              className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 hover:border-amber-400 transition-colors bg-zinc-100 dark:bg-zinc-800"
              title={`Open photo ${idx + 1}`}
            >
              <img
                src={url}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>
            Showing {visibleCount} of {list.length} photos
            {shouldLoop ? ' - auto loop enabled' : ''}
          </span>
          <span className="font-mono">Click photo to zoom</span>
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X className="w-6 h-6" />
            </button>

            {list.length > 1 && (
              <button
                className="absolute left-4 sm:left-8 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((prev) => (prev === null ? prev : (prev - 1 + list.length) % list.length));
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={lightbox}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-[1100px] max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl bg-zinc-950/90 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={list[lightbox]}
                  alt=""
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>

            {list.length > 1 && (
              <button
                className="absolute right-4 sm:right-8 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((prev) => (prev === null ? prev : (prev + 1) % list.length));
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CompanyName({ company }: { company: string }) {
  const name = company.toLowerCase();
  if (name.includes('ministry of planning')) {
    return (
      <a
        href="https://mop.gov.kh/kh/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-600 dark:text-amber-400 hover:underline"
      >
        {company}
      </a>
    );
  }
  if (name.includes('sunrise institute')) {
    return (
      <a
        href="https://www.sunriseinstitute.tech/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-600 dark:text-amber-400 hover:underline"
      >
        {company}
      </a>
    );
  }
  return <span className="text-amber-600 dark:text-amber-400">{company}</span>;
}

function SectionCard({
  title,
  subtitle,
  date,
  description,
  photos,
}: {
  title: string;
  subtitle: React.ReactNode;
  date: string;
  description: string;
  photos?: string[];
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/30 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-base font-medium">{subtitle}</p>
        </div>
        <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1 w-fit">
          {date}
        </div>
      </div>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line text-sm sm:text-base">
        {description}
      </p>
      <PhotoPreviewLoop photos={photos} />
    </motion.article>
  );
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
          <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">
            {edu.degree} in {edu.field}
          </h3>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300 font-medium">{edu.institution}</p>
        </div>
        <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400 bg-white/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1 w-fit">
          {edu.startDate} - {edu.endDate || 'Present'}
        </div>
      </div>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line text-sm sm:text-base">
        {edu.description}
      </p>
      <PhotoPreviewLoop photos={edu.photos} />
    </motion.article>
  );
}

export default function Experience() {
  const {
    experience: experiences,
    education,
    experienceLoaded,
    fetchExperienceAndEducation,
  } = useDataStore();

  useEffect(() => {
    fetchExperienceAndEducation();
  }, [fetchExperienceAndEducation]);

  if (!experienceLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="space-y-24">
        <section className="w-full">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white">
            Experience
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            My professional journey and roles.
          </p>
          <div className="mt-8 space-y-5">
            {experiences.map((exp: ExperienceItem) => (
              <SectionCard
                key={exp.id}
                title={exp.title}
                subtitle={<CompanyName company={exp.company} />}
                date={`${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}`}
                description={exp.description}
                photos={exp.photos}
              />
            ))}
          </div>
        </section>

        <section id="education" className="w-full">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white">
            Education
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Academic background and qualifications.
          </p>
          <div className="mt-8 space-y-5">
            {education.map((edu: EducationItem) => (
              <EducationCard key={edu.id} edu={edu} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
