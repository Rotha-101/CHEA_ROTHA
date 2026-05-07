import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useDataStore } from '../store/dataStore';
import CodingConsole from '../components/CodingConsole';

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

        <CodingConsole />
      </motion.div>
    </div>
  );
}
