import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useDataStore } from '../store/dataStore';

export default function About() {
  const { profile, profileLoaded, fetchProfileAndSkills, settings } = useDataStore();
 
  useEffect(() => {
    fetchProfileAndSkills();
  }, [fetchProfileAndSkills]);
 
  if (!profileLoaded) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-4">
          <span className="text-[#ff4d4d] font-mono opacity-80">⟩</span>
          {settings?.aboutTitle || 'About Me'}
        </h1>
        {settings?.aboutSubtitle && (
          <p className="text-lg sm:text-xl text-[#ff4d4d] font-medium mb-6 tracking-tight">
            {settings.aboutSubtitle}
          </p>
        )}
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
          {profile?.aboutMe || profile?.bio}
        </p>

        {profile?.aboutSectionCoverUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative h-[250px] md:h-[350px] w-full rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/5 shadow-2xl group bg-zinc-100 dark:bg-white/5"
          >
            <img 
              src={profile.aboutSectionCoverUrl} 
              alt="About Section Banner" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050810] to-transparent opacity-40 dark:opacity-60" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
