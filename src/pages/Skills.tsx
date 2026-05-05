import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  BrainCircuit,
  Code2,
  Database,
  Globe,
  Layout,
  LineChart,
  MessageSquare,
  Server,
  Terminal,
  Wrench,
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';

const getSkillIcon = (name: string, category: string) => {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();

  if (
    lowerName.includes('python') ||
    lowerName.includes('javascript') ||
    lowerName.includes('typescript') ||
    lowerName.includes('java')
  ) return <Code2 className="w-5 h-5" />;
  if (lowerName.includes('sql') || lowerName.includes('database') || lowerName.includes('mongo')) return <Database className="w-5 h-5" />;
  if (lowerCat.includes('machine learning') || lowerCat.includes('ai') || lowerName.includes('deep learning')) return <BrainCircuit className="w-5 h-5" />;
  if (lowerCat.includes('time series') || lowerCat.includes('data analysis') || lowerName.includes('pandas')) return <LineChart className="w-5 h-5" />;
  if (lowerCat.includes('nlp') || lowerName.includes('language')) return <MessageSquare className="w-5 h-5" />;
  if (lowerName.includes('react') || lowerName.includes('html') || lowerName.includes('css')) return <Layout className="w-5 h-5" />;
  if (lowerName.includes('node') || lowerName.includes('express') || lowerName.includes('api')) return <Server className="w-5 h-5" />;
  if (lowerName.includes('docker') || lowerName.includes('aws') || lowerName.includes('cloud')) return <Globe className="w-5 h-5" />;
  if (lowerName.includes('git') || lowerName.includes('linux') || lowerName.includes('bash')) return <Terminal className="w-5 h-5" />;

  return <Wrench className="w-5 h-5" />;
};

const normalizeLevel = (level: number) => Math.max(0, Math.min(100, Number(level) || 0));

const getSkillBlurb = (name: string, category: string, level: number) => {
  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();

  if (lowerName.includes('python')) return 'Core language for analytics, automation, and model development.';
  if (lowerName.includes('sql')) return 'Query, model, and manage structured data with confidence.';
  if (lowerCategory.includes('machine')) return 'Build practical ML pipelines from feature engineering to prediction.';
  if (lowerCategory.includes('time series')) return 'Forecast trends and seasonality with robust temporal models.';
  if (lowerCategory.includes('visual')) return 'Create clear dashboards and visuals for decision-making.';
  if (lowerCategory.includes('nlp')) return 'Process and model language data for real-world AI use cases.';
  if (lowerCategory.includes('database')) return 'Design schemas and maintain reliable relational data systems.';
  if (lowerCategory.includes('tool')) return 'Productive daily toolkit for coding, experiments, and deployment.';
  if (lowerCategory.includes('programming')) return 'Strong coding foundation for scalable software and data workflows.';
  return `Practical ${category.toLowerCase()} capability with ${level}% proficiency.`;
};

export default function Skills() {
  const { skills, profileLoaded, fetchProfileAndSkills, settings } = useDataStore();
  const [liveSettings, setLiveSettings] = useState<Record<string, any> | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    fetchProfileAndSkills();
    // Always fetch FRESH settings from API to bypass the Zustand cache guard.
    // This ensures admin changes to disabled categories are immediately visible.
    (async () => {
      try {
        const res = await fetch('/api/db/settings');
        if (res.ok) setLiveSettings(await res.json());
      } catch { /* show all categories as fallback */ }
      setSettingsReady(true);
    })();
  }, [fetchProfileAndSkills]);

  if (!profileLoaded || !settingsReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const CATEGORY_ORDER: string[] = liveSettings?.skillCategoryOrder || settings?.skillCategoryOrder || [
    'IDE & Editors',
    'Programming Languages',
    'Data Wrangling & EDA',
    'Machine Learning',
    'Time Series Forecasting',
    'Deep Learning & AI',
    'NLP',
    'Cloud & MLOps',
    'Data Engineering',
    'Experiment Tracking & Model Management',
    'Statistics & Math',
    'Data Visualization',
    'Databases',
    'Core Strengths'
  ];

  // Always read disabled list from fresh API data (fallback to Zustand settings on Vercel)
  const DISABLED_CATEGORIES: string[] = liveSettings?.disabledSkillCategories || settings?.disabledSkillCategories || [];

  const disabledSet = new Set(DISABLED_CATEGORIES.map(c => c.trim().toLowerCase()));
  const orderSet = new Set(CATEGORY_ORDER.map(c => c.trim().toLowerCase()));

  const groupedSkills: { category: string; skills: typeof skills }[] = [];
  
  // Add categories in the exact specified order, skipping disabled ones
  CATEGORY_ORDER.forEach(category => {
    if (disabledSet.has(category.trim().toLowerCase())) return; // skip hidden categories
    const categorySkills = skills.filter(s => s.category.trim().toLowerCase() === category.trim().toLowerCase()).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    if (categorySkills.length > 0) {
      groupedSkills.push({ category, skills: categorySkills });
    }
  });

  // Add any other categories that are not in CATEGORY_ORDER
  const otherCategories = Array.from(new Set(skills.map(s => s.category).filter(c => !orderSet.has(c.trim().toLowerCase()) && !disabledSet.has(c.trim().toLowerCase()))));
  otherCategories.forEach(category => {
    const categorySkills = skills.filter(s => s.category === category).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    if (categorySkills.length > 0) {
      groupedSkills.push({ category, skills: categorySkills });
    }
  });

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-14"
        >
          <p className="inline-flex items-center rounded-full border border-[#ff4d4d]/20 bg-[#ff4d4d]/5 px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff4d4d] mb-6">
            Technical Stack
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-4">
            <span className="text-[#ff4d4d] font-mono opacity-80">⟩</span>
            {settings?.skillsTitle || 'Technical Arsenal'}
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            {settings?.skillsSubtitle || 'A curated visual tool-grid of technical strengths.'}
          </p>
        </motion.div>

        <div className="space-y-20">
          {groupedSkills.map((group, groupIdx) => (
            <div key={group.category}>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: groupIdx * 0.1 }}
                className="text-xl sm:text-2xl font-display font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3"
              >
                <span className="text-[#ff4d4d] font-mono opacity-60 text-lg">⟩</span>
                {group.category}
              </motion.h2>
              <div className="relative w-full overflow-hidden py-6">
                <motion.div 
                  className="flex gap-4 sm:gap-6 w-max"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ 
                    duration: 30 + (group.skills.length * 2), 
                    repeat: Infinity, 
                    ease: "linear",
                  }}
                  whileHover={{ animationPlayState: 'paused' }}
                >
                  {[...group.skills, ...group.skills, ...group.skills].map((skill, idx) => {
                    const level = normalizeLevel(skill.level);
                    return (
                      <motion.article
                        key={`${skill.id}-${idx}`}
                        whileHover={{ y: -8, scale: 1.05 }}
                        className={`relative flex flex-col items-center p-6 rounded-3xl transition-all duration-500 w-[160px] sm:w-[180px] h-[240px] flex-shrink-0 ${
                          skill.isHighlighted 
                            ? 'bg-[#ff4d4d]/5 border border-[#ff4d4d]/30 shadow-[0_0_30px_rgba(255,77,77,0.1)]' 
                            : 'bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:border-[#ff4d4d]/30 hover:bg-zinc-100 dark:hover:bg-white/[0.07]'
                        } backdrop-blur-md cursor-pointer group hover:shadow-[0_0_40px_rgba(255,77,77,0.05)]`}
                      >
                        {/* Icon Container */}
                        <div className="relative flex-1 w-full flex items-center justify-center mb-6">
                          <div className={`absolute inset-4 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                            skill.isHighlighted ? 'bg-[#ff4d4d]' : 'bg-white'
                          }`} />
                          
                          <div className="h-full w-full p-2 flex items-center justify-center relative z-0">
                            {skill.iconUrl ? (
                              <img
                                src={skill.iconUrl}
                                alt={`${skill.name} logo`}
                                className="max-h-16 sm:max-h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-10 w-10 sm:h-12 sm:w-12 text-[#ff4d4d] flex items-center justify-center">
                                {getSkillIcon(skill.name, skill.category)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center w-full mt-auto">
                          <div className="h-14 mb-2 flex flex-col justify-center px-1">
                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight line-clamp-2 leading-tight">
                              {skill.name}
                            </h3>
                            <p className="mt-1 text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-zinc-500 line-clamp-1">
                              {skill.category}
                            </p>
                          </div>
                          
                          <div className="w-full h-1 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${level}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-full ${skill.isHighlighted ? 'bg-[#ff4d4d] shadow-[0_0_10px_#ff4d4d]' : 'bg-zinc-400 dark:bg-white/20'}`}
                            />
                          </div>
                          
                          <div className="mt-3 h-8 overflow-hidden">
                            <p className="text-[10px] leading-snug text-zinc-400 line-clamp-2 italic opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {skill.description || getSkillBlurb(skill.name, skill.category, level)}
                            </p>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
