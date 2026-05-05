import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { cn } from '../lib/utils';

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

function PhotoPreviewLoop({ photos }: { photos?: string[] }) {
  const list = photos || [];
  const [isMobile, setIsMobile] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const visibleCount = isMobile ? 1 : Math.min(4, list.length);
  const shouldLoop = list.length > (isMobile ? 1 : 0); // Always loop if more than 1 photo on mobile, or any on desktop if we want movement

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
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visiblePhotos.map(({ idx, url }) => (
          <button
            key={`${url}-${idx}-${startIndex}`}
            onClick={() => setLightbox(idx)}
            className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 hover:border-[#ff4d4d]/50 transition-all duration-300 bg-white/5"
            title={`Open photo ${idx + 1}`}
          >
          <AnimatePresence mode="popLayout">
            <motion.img
              key={url}
              src={url}
              alt=""
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </AnimatePresence>
          </button>
        ))}
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
        className="text-[#ff4d4d] hover:underline"
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
        className="text-[#ff4d4d] hover:underline"
      >
        {company}
      </a>
    );
  }
  return <span className="text-[#ff4d4d]">{company}</span>;
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="group rounded-3xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 p-6 sm:p-8 hover:border-[#ff4d4d]/30 hover:bg-zinc-100 dark:hover:bg-white/[0.07] transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,77,77,0.05)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 dark:text-white group-hover:text-[#ff4d4d] transition-colors">{title}</h3>
          <p className="mt-1.5 text-base sm:text-lg font-medium text-zinc-700 dark:text-zinc-300 opacity-90">{subtitle}</p>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-white/10 rounded-full px-4 py-1.5 w-fit">
          {date}
        </div>
      </div>
      <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line text-sm sm:text-base">
        {description}
      </p>
      <PhotoPreviewLoop photos={photos} />
    </motion.article>
  );
}


export default function Experience() {
  const {
    experience: experiences,
    education,
    experienceLoaded,
    fetchExperienceAndEducation,
    settings,
    profile,
  } = useDataStore();
 
  useEffect(() => {
    fetchExperienceAndEducation();
  }, [fetchExperienceAndEducation]);
 
  if (!experienceLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
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
      <section className="w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-4">
          <span className="text-[#ff4d4d] font-mono opacity-80">⟩</span>
          {settings?.experienceTitle || 'Experience'}
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm sm:text-base max-w-2xl">
          {settings?.experienceSubtitle || 'My professional journey and roles.'}
        </p>
        <div className="mt-12 space-y-8">
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
    </div>
  );
}
