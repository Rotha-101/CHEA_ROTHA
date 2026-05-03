import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useDataStore } from '../store/dataStore';

export default function About() {
  const { profile, profileLoaded, fetchProfileAndSkills } = useDataStore();

  useEffect(() => {
    fetchProfileAndSkills();
  }, [fetchProfileAndSkills]);

  if (!profileLoaded) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
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
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6">About Me</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap text-lg">
          {profile?.aboutMe || profile?.bio}
        </p>
      </motion.div>
    </div>
  );
}
