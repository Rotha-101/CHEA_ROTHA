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
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
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
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
          {settings?.referencesTitle || 'References'}
        </h2>
        <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {settings?.referencesSubtitle || 'Professional references and contact points.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedReferences.map((ref, idx) => (
          <motion.article
            key={ref.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.07 }}
            className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-sm p-6"
          >
            <div className="flex items-start gap-4">
              <div className="h-24 w-24 rounded-full border-2 border-amber-400/50 bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                {ref.profileImageUrl ? (
                  <img
                    src={ref.profileImageUrl}
                    alt={ref.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <UserRound className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {ref.profileUrl ? (
                  <a
                    href={ref.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-2xl font-display font-bold text-zinc-900 dark:text-white leading-tight hover:text-amber-500 transition-colors"
                  >
                    {ref.name}
                  </a>
                ) : (
                  <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white leading-tight">
                    {ref.name}
                  </h3>
                )}
                <p className="mt-1 text-amber-600 dark:text-amber-400 font-medium">
                  {ref.title}
                </p>
              </div>
            </div>

            {ref.description && (
              <p className="mt-5 text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {ref.description}
              </p>
            )}

            <div className="mt-5 space-y-2 text-sm">
              {ref.phone && (
                <a
                  href={`tel:${ref.phone}`}
                  className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {ref.phone}
                </a>
              )}
              {ref.email && (
                <a
                  href={`mailto:${ref.email}`}
                  className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors break-all"
                >
                  <Mail className="w-4 h-4" />
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
