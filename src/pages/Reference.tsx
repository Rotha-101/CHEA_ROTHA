import { useEffect } from 'react';
import { Mail, Phone, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useDataStore } from '../store/dataStore';

interface ReferenceItem {
  id: string;
  name: string;
  title: string;
  description: string;
  phone: string;
  email: string;
  profileImageUrl?: string;
  profileUrl?: string;
  priority: number;
}

export default function Reference() {
  const { references, profileLoaded, fetchProfileAndSkills, settings } = useDataStore();
 
  useEffect(() => {
    fetchProfileAndSkills();
  }, [fetchProfileAndSkills]);
 
  if (!profileLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
 
  if (!references?.length) return null;
 
  const sortedReferences = [...references].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
 
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mb-16"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-4">
          <span className="text-[#ff4d4d] font-mono opacity-80">⟩</span>
          {settings?.referencesTitle || 'References'}
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          {settings?.referencesSubtitle || 'Professional references and contact points.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sortedReferences.map((ref, idx) => (
          <motion.article
            key={ref.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.07 }}
            className="group rounded-[32px] border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 p-8 hover:border-[#ff4d4d]/30 hover:bg-zinc-100 dark:hover:bg-white/[0.07] transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,77,77,0.08)]"
          >
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-2xl border border-[#ff4d4d]/20 bg-white/5 overflow-hidden flex-shrink-0 group-hover:border-[#ff4d4d]/50 transition-colors">
                {ref.profileImageUrl ? (
                  <img
                    src={ref.profileImageUrl}
                    alt={ref.name}
                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <UserRound className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {ref.profileUrl ? (
                  <a
                    href={ref.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xl sm:text-2xl font-display font-bold text-zinc-900 dark:text-white leading-tight hover:text-[#ff4d4d] transition-colors"
                  >
                    {ref.name}
                  </a>
                ) : (
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 dark:text-white leading-tight">
                    {ref.name}
                  </h3>
                )}
                <p className="mt-2 text-[#ff4d4d] font-bold text-sm tracking-tight uppercase">
                  {ref.title}
                </p>
              </div>
            </div>

            {ref.description && (
              <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm sm:text-base italic">
                &ldquo;{ref.description}&rdquo;
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-6 pt-6 border-t border-zinc-200 dark:border-white/5">
              {ref.phone && (
                <a
                  href={`tel:${ref.phone}`}
                  className="flex items-center gap-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#ff4d4d]" />
                  {ref.phone}
                </a>
              )}
              {ref.email && (
                <a
                  href={`mailto:${ref.email}`}
                  className="flex items-center gap-2.5 text-sm font-bold text-zinc-500 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-[#ff4d4d]" />
                  {ref.email}
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
